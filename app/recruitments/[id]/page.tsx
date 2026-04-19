"use client"

import { useState, useEffect, useRef, use } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"

interface Player { id: string; name: string }
interface Application {
  id: string
  playerId: string
  status: string
  message: string
  createdAt: string
  player: Player
}
interface Message {
  id: string
  senderId: string
  receiverId: string | null
  content: string
  createdAt: string
  sender: Player
}
interface Rating {
  id: string
  raterId: string
  ratedUserId: string
  score: number
  comment: string
  rater: Player
  ratedUser: Player
}
interface Recruitment {
  id: string
  title: string
  description: string
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
  recruiterId: string
  recruiter: { id: string; name: string; isPremium: boolean }
  applications: Application[]
  ratings: Rating[]
  _count: { applications: number }
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          className={`text-2xl transition-colors ${
            star <= value ? "text-yellow-400" : "text-gray-300"
          } ${onChange ? "hover:text-yellow-300 cursor-pointer" : "cursor-default"}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default function RecruitmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session } = useSession()
  const [recruitment, setRecruitment] = useState<Recruitment | null>(null)
  const [loading, setLoading] = useState(true)
  const [applyMsg, setApplyMsg] = useState("")
  const [applyLoading, setApplyLoading] = useState(false)
  const [applyError, setApplyError] = useState("")
  const [applySuccess, setApplySuccess] = useState(false)

  // Chat
  const [messages, setMessages] = useState<Message[]>([])
  const [chatType, setChatType] = useState<"thread" | "private">("thread")
  const [newMsg, setNewMsg] = useState("")
  const [msgLoading, setMsgLoading] = useState(false)
  const msgEndRef = useRef<HTMLDivElement>(null)

  // Rating
  const [rateUserId, setRateUserId] = useState("")
  const [rateScore, setRateScore] = useState(5)
  const [rateComment, setRateComment] = useState("")
  const [rateLoading, setRateLoading] = useState(false)
  const [rateError, setRateError] = useState("")
  const [rateSuccess, setRateSuccess] = useState(false)

  // Status change
  const [statusLoading, setStatusLoading] = useState(false)

  useEffect(() => {
    fetchRecruitment()
  }, [id])

  useEffect(() => {
    if (recruitment && canChat) {
      fetchMessages()
    }
  }, [recruitment, chatType])

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function fetchRecruitment() {
    setLoading(true)
    const res = await fetch(`/api/recruitments/${id}`)
    const data = await res.json()
    if (res.ok) setRecruitment(data)
    setLoading(false)
  }

  const userId = (session?.user as any)?.id
  const isRecruiter = recruitment?.recruiterId === userId
  const myApplication = recruitment?.applications.find(a => a.playerId === userId)
  const isApproved = myApplication?.status === "approved"
  const canChat = isRecruiter || isApproved

  async function fetchMessages() {
    const res = await fetch(`/api/messages?recruitmentId=${id}&type=${chatType}`)
    if (res.ok) {
      const data = await res.json()
      setMessages(data)
    }
  }

  async function handleApply(e: React.FormEvent) {
    e.preventDefault()
    setApplyLoading(true)
    setApplyError("")
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recruitmentId: id, message: applyMsg }),
    })
    const data = await res.json()
    setApplyLoading(false)
    if (!res.ok) {
      setApplyError(data.error)
    } else {
      setApplySuccess(true)
      fetchRecruitment()
    }
  }

  async function handleApplicationStatus(applicationId: string, status: string) {
    const res = await fetch("/api/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId, status }),
    })
    if (res.ok) fetchRecruitment()
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMsg.trim()) return
    setMsgLoading(true)
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recruitmentId: id, content: newMsg, receiverId: null }),
    })
    setMsgLoading(false)
    if (res.ok) {
      setNewMsg("")
      fetchMessages()
    }
  }

  async function handleRate(e: React.FormEvent) {
    e.preventDefault()
    if (!rateUserId) return
    setRateLoading(true)
    setRateError("")
    const res = await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recruitmentId: id, ratedUserId: rateUserId, score: rateScore, comment: rateComment }),
    })
    const data = await res.json()
    setRateLoading(false)
    if (!res.ok) {
      setRateError(data.error)
    } else {
      setRateSuccess(true)
      setRateUserId("")
      setRateScore(5)
      setRateComment("")
      fetchRecruitment()
    }
  }

  async function handleStatusChange(newStatus: string) {
    setStatusLoading(true)
    await fetch(`/api/recruitments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    setStatusLoading(false)
    fetchRecruitment()
  }

  if (loading) {
    return <div className="flex justify-center py-20 text-gray-400">読み込み中...</div>
  }

  if (!recruitment) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-500">募集が見つかりません</p>
        <Link href="/recruitments" className="text-purple-600 mt-4 hover:underline">一覧に戻る</Link>
      </div>
    )
  }

  const rewardVal = recruitment.rewardAmount
  const isPaid = rewardVal > 0
  const isEntryFee = rewardVal < 0
  const fee = Math.abs(rewardVal)
  const platformFee = Math.round(fee * 0.1)
  const approvedApplications = recruitment.applications.filter(a => a.status === "approved")

  const statusLabels: Record<string, string> = {
    open: "募集中",
    closed: "締め切り",
    finished: "終了",
  }
  const statusColors: Record<string, string> = {
    open: "bg-green-100 text-green-700",
    closed: "bg-orange-100 text-orange-700",
    finished: "bg-gray-100 text-gray-600",
  }

  const avgRating = recruitment.ratings.length > 0
    ? (recruitment.ratings.reduce((sum, r) => sum + r.score, 0) / recruitment.ratings.length).toFixed(1)
    : null

  // Who can the current user rate?
  const ratableUsers: Player[] = []
  if (isRecruiter) {
    // Recruiter can rate approved applicants
    approvedApplications.forEach(a => {
      const alreadyRated = recruitment.ratings.some(r => r.raterId === userId && r.ratedUserId === a.playerId)
      if (!alreadyRated) ratableUsers.push(a.player)
    })
  } else if (isApproved) {
    // Approved player can rate recruiter
    const alreadyRated = recruitment.ratings.some(r => r.raterId === userId && r.ratedUserId === recruitment.recruiterId)
    if (!alreadyRated) ratableUsers.push(recruitment.recruiter)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[recruitment.status] || "bg-gray-100 text-gray-600"}`}>
                {statusLabels[recruitment.status] || recruitment.status}
              </span>
              {recruitment.recruiter.isPremium && (
                <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-full">PRO</span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{recruitment.title}</h1>
          </div>
          {isRecruiter && (
            <div className="flex gap-2">
              {recruitment.status === "open" && (
                <button
                  onClick={() => handleStatusChange("closed")}
                  disabled={statusLoading}
                  className="text-sm border border-orange-400 text-orange-600 px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50"
                >
                  締め切る
                </button>
              )}
              {recruitment.status !== "finished" && (
                <button
                  onClick={() => handleStatusChange("finished")}
                  disabled={statusLoading}
                  className="text-sm border border-gray-400 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  終了にする
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-purple-100 text-purple-700 text-sm px-3 py-1 rounded-full font-medium">{recruitment.gameName}</span>
          <span className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full font-medium">{recruitment.platform}</span>
          <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full font-medium">{recruitment.genre}</span>
        </div>

        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-6">{recruitment.description}</p>

        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">募集形式</span>
              <span className="font-medium">{recruitment.recruitmentType === "first-come" ? "⚡ 先着順" : "🔍 選考型"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">チャット</span>
              <span className="font-medium">
                {recruitment.chatType === "thread" ? "💬 スレッド型" : recruitment.chatType === "private" ? "🔒 個人チャット" : "📨 両方"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">参加者</span>
              <span className="font-medium">{recruitment.currentPlayers}/{recruitment.maxPlayers}人</span>
            </div>
            {recruitment.deadline && (
              <div className="flex justify-between">
                <span className="text-gray-500">締切</span>
                <span className="font-medium text-orange-600">
                  {new Date(recruitment.deadline).toLocaleString("ja-JP")}
                </span>
              </div>
            )}
          </div>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">報酬/参加費</span>
              <span className={`font-bold ${isPaid ? "text-green-600" : isEntryFee ? "text-red-500" : "text-gray-600"}`}>
                {isPaid ? `謝礼 ¥${fee.toLocaleString()}` : isEntryFee ? `参加費 ¥${fee.toLocaleString()}` : "なし"}
              </span>
            </div>
            {rewardVal !== 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">プラットフォーム手数料</span>
                <span className="font-medium text-purple-600">¥{platformFee.toLocaleString()} (10%)</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">掲載者</span>
              <span className="font-medium">{recruitment.recruiter.name}</span>
            </div>
            {avgRating && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500">評価</span>
                <span className="font-medium text-yellow-600">★ {avgRating} ({recruitment.ratings.length}件)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Section */}
      {!isRecruiter && session && recruitment.status === "open" && !myApplication && (
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">このテストに応募する</h2>
          {applySuccess ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {recruitment.recruitmentType === "first-come" ? "応募が承認されました！" : "応募を受け付けました。審査をお待ちください。"}
            </div>
          ) : (
            <form onSubmit={handleApply} className="space-y-4">
              {applyError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{applyError}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">応募メッセージ（任意）</label>
                <textarea
                  value={applyMsg}
                  onChange={e => setApplyMsg(e.target.value)}
                  rows={3}
                  placeholder="自己紹介や参加の動機などを記載してください"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={applyLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {applyLoading ? "応募中..." : "応募する"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* My Application Status */}
      {myApplication && (
        <div className={`rounded-2xl p-4 border ${
          myApplication.status === "approved" ? "bg-green-50 border-green-200" :
          myApplication.status === "rejected" ? "bg-red-50 border-red-200" :
          "bg-yellow-50 border-yellow-200"
        }`}>
          <p className="font-medium">
            {myApplication.status === "approved" ? "✅ 応募が承認されました" :
             myApplication.status === "rejected" ? "❌ 応募が不承認となりました" :
             "⏳ 審査中です。しばらくお待ちください"}
          </p>
        </div>
      )}

      {!session && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-center">
          <p className="text-purple-700">
            応募するには{" "}
            <Link href="/auth/login" className="font-bold hover:underline">ログイン</Link>
            {" "}が必要です
          </p>
        </div>
      )}

      {/* Applications Management (Recruiter) */}
      {isRecruiter && recruitment.applications.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">応募者管理 ({recruitment.applications.length}人)</h2>
          <div className="space-y-3">
            {recruitment.applications.map(app => (
              <div key={app.id} className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-800">{app.player.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      app.status === "approved" ? "bg-green-100 text-green-700" :
                      app.status === "rejected" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {app.status === "approved" ? "承認" : app.status === "rejected" ? "不承認" : "審査中"}
                    </span>
                  </div>
                  {app.message && <p className="text-sm text-gray-600">{app.message}</p>}
                  <p className="text-xs text-gray-400 mt-1">{new Date(app.createdAt).toLocaleString("ja-JP")}</p>
                </div>
                {app.status === "pending" && recruitment.recruitmentType === "selective" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleApplicationStatus(app.id, "approved")}
                      className="text-xs bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      承認
                    </button>
                    <button
                      onClick={() => handleApplicationStatus(app.id, "rejected")}
                      className="text-xs bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      不承認
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Section */}
      {canChat && (
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">チャット</h2>
            {(recruitment.chatType === "both") && (
              <div className="flex gap-2">
                <button
                  onClick={() => setChatType("thread")}
                  className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${chatType === "thread" ? "bg-purple-600 text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                >
                  スレッド
                </button>
                <button
                  onClick={() => setChatType("private")}
                  className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${chatType === "private" ? "bg-purple-600 text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                >
                  個人
                </button>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 h-72 overflow-y-auto mb-4 flex flex-col gap-3">
            {messages.length === 0 ? (
              <p className="text-gray-400 text-sm text-center my-auto">メッセージはまだありません</p>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.senderId === userId ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs sm:max-w-md rounded-2xl px-4 py-2 ${
                    msg.senderId === userId
                      ? "bg-purple-600 text-white rounded-br-sm"
                      : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                  }`}>
                    {msg.senderId !== userId && (
                      <p className="text-xs font-semibold text-purple-600 mb-1">{msg.sender.name}</p>
                    )}
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.senderId === userId ? "text-purple-200" : "text-gray-400"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={msgEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
              placeholder="メッセージを入力..."
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
            />
            <button
              type="submit"
              disabled={msgLoading || !newMsg.trim()}
              className="bg-purple-600 text-white px-5 py-3 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              送信
            </button>
          </form>
        </div>
      )}

      {/* Rating Section */}
      {canChat && ratableUsers.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">評価する</h2>
          {rateSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
              評価を送信しました！
            </div>
          )}
          {rateError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{rateError}</div>
          )}
          <form onSubmit={handleRate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">評価する相手</label>
              <select
                value={rateUserId}
                onChange={e => setRateUserId(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white"
              >
                <option value="">選択してください</option>
                {ratableUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">評価（1〜5）</label>
              <StarRating value={rateScore} onChange={setRateScore} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">コメント（任意）</label>
              <textarea
                value={rateComment}
                onChange={e => setRateComment(e.target.value)}
                rows={3}
                placeholder="感想やフィードバックを記載してください"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={rateLoading || !rateUserId}
              className="bg-yellow-400 text-yellow-900 px-6 py-3 rounded-xl font-semibold hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {rateLoading ? "送信中..." : "評価を送信"}
            </button>
          </form>
        </div>
      )}

      {/* Ratings Display */}
      {recruitment.ratings.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">評価一覧</h2>
          <div className="space-y-3">
            {recruitment.ratings.map(r => (
              <div key={r.id} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm">
                    <span className="font-medium text-gray-800">{r.rater.name}</span>
                    <span className="text-gray-500"> → </span>
                    <span className="font-medium text-gray-800">{r.ratedUser.name}</span>
                  </div>
                  <StarRating value={r.score} />
                </div>
                {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
