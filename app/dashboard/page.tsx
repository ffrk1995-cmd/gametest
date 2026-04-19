"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"

interface Recruitment {
  id: string
  title: string
  gameName: string
  platform: string
  status: string
  currentPlayers: number
  maxPlayers: number
  rewardAmount: number
  recruitmentType: string
  createdAt: string
  _count?: { applications: number }
}

interface Application {
  id: string
  status: string
  message: string
  createdAt: string
  recruitment: {
    id: string
    title: string
    gameName: string
    platform: string
    status: string
    rewardAmount: number
    recruiter: { name: string }
  }
}

interface UserProfile {
  id: string
  name: string
  isPremium: boolean
  premiumUntil: string | null
  createdAt: string
  ratingsReceived: Array<{
    id: string
    score: number
    comment: string
    rater: { id: string; name: string }
  }>
  _count: { applications: number; recruitments: number }
}

const statusLabels: Record<string, string> = { open: "募集中", closed: "締め切り", finished: "終了" }
const statusColors: Record<string, string> = {
  open: "bg-green-100 text-green-700",
  closed: "bg-orange-100 text-orange-700",
  finished: "bg-gray-100 text-gray-600",
}
const appStatusLabels: Record<string, string> = { pending: "審査中", approved: "承認", rejected: "不承認" }
const appStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState<"recruitments" | "applications" | "profile">("recruitments")
  const [myRecruitments, setMyRecruitments] = useState<Recruitment[]>([])
  const [myApplications, setMyApplications] = useState<Application[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
      fetchData()
    }
  }, [session])

  async function fetchData() {
    setLoading(true)
    const userId = (session?.user as any)?.id

    const [recruitRes, appRes, profileRes] = await Promise.all([
      fetch("/api/my-recruitments"),
      fetch("/api/applications"),
      fetch(`/api/users/${userId}`),
    ])

    if (recruitRes.ok) {
      const recData = await recruitRes.json()
      setMyRecruitments(Array.isArray(recData) ? recData : [])
    }

    if (appRes.ok) {
      const appData = await appRes.json()
      setMyApplications(Array.isArray(appData) ? appData : [])
    }

    if (profileRes.ok) {
      const profData = await profileRes.json()
      setProfile(profData)
    }

    setLoading(false)
  }

  if (status === "loading" || loading) {
    return <div className="flex justify-center py-20 text-gray-400">読み込み中...</div>
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-gray-600">ダッシュボードを見るにはログインが必要です</p>
        <Link href="/auth/login" className="text-purple-600 hover:underline font-medium">ログインする →</Link>
      </div>
    )
  }

  const avgRating = profile && profile.ratingsReceived.length > 0
    ? (profile.ratingsReceived.reduce((sum, r) => sum + r.score, 0) / profile.ratingsReceived.length).toFixed(1)
    : null

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">ダッシュボード</h1>
        <p className="text-gray-500 mt-1">こんにちは、{session.user.name}さん</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-md text-center">
          <div className="text-3xl font-bold text-purple-600">{myRecruitments.length}</div>
          <div className="text-sm text-gray-500 mt-1">作成した募集</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-md text-center">
          <div className="text-3xl font-bold text-blue-600">{myApplications.length}</div>
          <div className="text-sm text-gray-500 mt-1">応募した募集</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-md text-center">
          <div className="text-3xl font-bold text-yellow-500">{avgRating || "—"}</div>
          <div className="text-sm text-gray-500 mt-1">平均評価</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-md text-center">
          <div className={`text-3xl font-bold ${profile?.isPremium ? "text-yellow-500" : "text-gray-400"}`}>
            {profile?.isPremium ? "★" : "—"}
          </div>
          <div className="text-sm text-gray-500 mt-1">プレミアム</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {[
          { key: "recruitments", label: "作成した募集" },
          { key: "applications", label: "応募した募集" },
          { key: "profile", label: "プロフィール・評価" },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* My Recruitments */}
      {activeTab === "recruitments" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">作成した募集一覧</h2>
            <Link
              href="/recruitments/new"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              + 新規作成
            </Link>
          </div>
          {myRecruitments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
              <div className="text-5xl mb-3">📋</div>
              <p className="text-gray-500">まだ募集を作成していません</p>
              <Link href="/recruitments/new" className="inline-block mt-3 text-purple-600 hover:underline font-medium text-sm">
                最初の募集を作成する →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myRecruitments.map(r => (
                <Link key={r.id} href={`/recruitments/${r.id}`}>
                  <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-purple-200 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColors[r.status] || "bg-gray-100 text-gray-600"}`}>
                          {statusLabels[r.status] || r.status}
                        </span>
                        <h3 className="font-semibold text-gray-800">{r.title}</h3>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                        <span>{r.gameName}</span>
                        <span>•</span>
                        <span>{r.platform}</span>
                        <span>•</span>
                        <span>{r.currentPlayers}/{r.maxPlayers}人</span>
                        <span>•</span>
                        <span>{new Date(r.createdAt).toLocaleDateString("ja-JP")}</span>
                      </div>
                    </div>
                    <div className="text-sm text-purple-600 font-medium flex-shrink-0">詳細 →</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Applications */}
      {activeTab === "applications" && (
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">応募した募集一覧</h2>
          {myApplications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
              <div className="text-5xl mb-3">🎮</div>
              <p className="text-gray-500">まだ応募した募集はありません</p>
              <Link href="/recruitments" className="inline-block mt-3 text-purple-600 hover:underline font-medium text-sm">
                募集を探す →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myApplications.map(app => (
                <Link key={app.id} href={`/recruitments/${app.recruitment?.id}`}>
                  <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-purple-200">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${appStatusColors[app.status] || "bg-gray-100 text-gray-600"}`}>
                            {appStatusLabels[app.status] || app.status}
                          </span>
                          <h3 className="font-semibold text-gray-800">{app.recruitment?.title}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                          <span>{app.recruitment?.gameName}</span>
                          <span>•</span>
                          <span>{app.recruitment?.platform}</span>
                          <span>•</span>
                          <span>by {app.recruitment?.recruiter?.name}</span>
                          <span>•</span>
                          <span>{new Date(app.createdAt).toLocaleDateString("ja-JP")}</span>
                        </div>
                      </div>
                      <div className="text-sm text-purple-600 font-medium flex-shrink-0">詳細 →</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Profile */}
      {activeTab === "profile" && profile && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">プロフィール</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">ニックネーム</span>
                <span className="font-medium text-gray-800">{profile.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">登録日</span>
                <span className="font-medium text-gray-800">{new Date(profile.createdAt).toLocaleDateString("ja-JP")}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">プレミアム</span>
                <span className={`font-medium ${profile.isPremium ? "text-yellow-600" : "text-gray-500"}`}>
                  {profile.isPremium
                    ? `有効（${profile.premiumUntil ? new Date(profile.premiumUntil).toLocaleDateString("ja-JP") : ""}まで）`
                    : "未登録"}
                </span>
              </div>
              {!profile.isPremium && (
                <div className="pt-2">
                  <Link
                    href="/premium"
                    className="inline-block bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    プレミアムに登録する →
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              受け取った評価
              {avgRating && (
                <span className="ml-2 text-yellow-500 font-bold">★ {avgRating}</span>
              )}
            </h2>
            {profile.ratingsReceived.length === 0 ? (
              <p className="text-gray-400 text-sm py-4 text-center">まだ評価を受け取っていません</p>
            ) : (
              <div className="space-y-3 mt-4">
                {profile.ratingsReceived.map(r => (
                  <div key={r.id} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{r.rater.name}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span key={star} className={`text-sm ${star <= r.score ? "text-yellow-400" : "text-gray-300"}`}>★</span>
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
