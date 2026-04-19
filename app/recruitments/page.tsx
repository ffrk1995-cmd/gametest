"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface Recruitment {
  id: string
  title: string
  gameName: string
  platform: string
  genre: string
  rewardAmount: number
  maxPlayers: number
  currentPlayers: number
  recruitmentType: string
  chatType: string
  status: string
  deadline: string | null
  createdAt: string
  recruiter: { id: string; name: string; isPremium: boolean }
  _count: { applications: number }
}

function RecruitmentCard({ r }: { r: Recruitment }) {
  const isPaid = r.rewardAmount > 0
  const isEntryFee = r.rewardAmount < 0
  const fee = Math.abs(r.rewardAmount)
  const platformFee = Math.round(fee * 0.1)

  return (
    <Link href={`/recruitments/${r.id}`}>
      <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 p-6 flex flex-col gap-3 border border-gray-100 hover:border-purple-200 cursor-pointer h-full">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-bold text-gray-800 leading-tight line-clamp-2">{r.title}</h2>
          {r.recruiter.isPremium && (
            <span className="flex-shrink-0 bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-full">
              PRO
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">
            {r.gameName}
          </span>
          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
            {r.platform}
          </span>
          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
            {r.genre}
          </span>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span className={`font-bold ${isPaid ? "text-green-600" : isEntryFee ? "text-red-500" : "text-gray-500"}`}>
            {isPaid
              ? `謝礼 ¥${fee.toLocaleString()} (手数料¥${platformFee.toLocaleString()})`
              : isEntryFee
              ? `参加費 ¥${fee.toLocaleString()}`
              : "報酬なし"}
          </span>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            👥 {r.currentPlayers}/{r.maxPlayers}人
          </span>
          <span className={`flex items-center gap-1 font-medium ${r.recruitmentType === "first-come" ? "text-blue-600" : "text-purple-600"}`}>
            {r.recruitmentType === "first-come" ? "⚡ 先着順" : "🔍 選考型"}
          </span>
          <span className="flex items-center gap-1">
            💬 {r.chatType === "thread" ? "スレッド" : r.chatType === "private" ? "個人" : "両方"}
          </span>
        </div>

        {r.deadline && (
          <div className="text-xs text-orange-600 font-medium">
            締切: {new Date(r.deadline).toLocaleDateString("ja-JP")}
          </div>
        )}

        <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>by {r.recruiter.name}</span>
          <span>{new Date(r.createdAt).toLocaleDateString("ja-JP")}</span>
        </div>
      </div>
    </Link>
  )
}

export default function RecruitmentsPage() {
  const [recruitments, setRecruitments] = useState<Recruitment[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchRecruitments(page)
  }, [page])

  async function fetchRecruitments(p: number) {
    setLoading(true)
    const res = await fetch(`/api/recruitments?page=${p}`)
    const data = await res.json()
    setRecruitments(data.recruitments || [])
    setTotalPages(data.totalPages || 1)
    setLoading(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">テスター募集一覧</h1>
          <p className="text-gray-500 mt-1">あなたに合った募集を見つけよう</p>
        </div>
        <Link
          href="/recruitments/new"
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-md"
        >
          + 新規募集
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-gray-400 text-lg">読み込み中...</div>
        </div>
      ) : recruitments.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎮</div>
          <p className="text-gray-500 text-lg">現在募集はありません</p>
          <Link href="/recruitments/new" className="inline-block mt-4 text-purple-600 hover:underline font-medium">
            最初の募集を作成する →
          </Link>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recruitments.map((r) => (
              <RecruitmentCard key={r.id} r={r} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                前へ
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    p === page
                      ? "bg-purple-600 text-white"
                      : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                次へ
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
