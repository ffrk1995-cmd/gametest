"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"

export default function NewRecruitmentPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    title: "",
    description: "",
    gameName: "",
    platform: "",
    genre: "",
    rewardAmount: "0",
    maxPlayers: "5",
    recruitmentType: "first-come",
    chatType: "thread",
    deadline: "",
  })

  if (status === "loading") {
    return <div className="flex justify-center py-20 text-gray-400">読み込み中...</div>
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-gray-600">募集を作成するにはログインが必要です</p>
        <Link href="/auth/login" className="text-purple-600 hover:underline font-medium">ログインする →</Link>
      </div>
    )
  }

  function updateForm(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/recruitments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        rewardAmount: parseInt(form.rewardAmount) || 0,
        maxPlayers: parseInt(form.maxPlayers) || 5,
        deadline: form.deadline || null,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || "募集の作成に失敗しました")
      return
    }

    router.push(`/recruitments/${data.id}`)
  }

  const rewardVal = parseInt(form.rewardAmount) || 0
  const platformFee = Math.round(Math.abs(rewardVal) * 0.1)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">新規テスター募集</h1>
        <p className="text-gray-500 mt-2">ゲームのテストプレイヤーを募集しましょう</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8 space-y-6">
        {/* Basic Info */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            募集タイトル <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={e => updateForm("title", e.target.value)}
            required
            placeholder="例：アクションRPGのバランステストプレイヤー募集"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            ゲーム名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.gameName}
            onChange={e => updateForm("gameName", e.target.value)}
            required
            placeholder="ゲームのタイトル"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              プラットフォーム <span className="text-red-500">*</span>
            </label>
            <select
              value={form.platform}
              onChange={e => updateForm("platform", e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white"
            >
              <option value="">選択してください</option>
              <option value="PC">PC</option>
              <option value="Mac">Mac</option>
              <option value="iOS">iOS</option>
              <option value="Android">Android</option>
              <option value="Nintendo Switch">Nintendo Switch</option>
              <option value="PlayStation">PlayStation</option>
              <option value="Xbox">Xbox</option>
              <option value="ブラウザ">ブラウザ</option>
              <option value="その他">その他</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ジャンル <span className="text-red-500">*</span>
            </label>
            <select
              value={form.genre}
              onChange={e => updateForm("genre", e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white"
            >
              <option value="">選択してください</option>
              <option value="アクション">アクション</option>
              <option value="RPG">RPG</option>
              <option value="アドベンチャー">アドベンチャー</option>
              <option value="パズル">パズル</option>
              <option value="シミュレーション">シミュレーション</option>
              <option value="ストラテジー">ストラテジー</option>
              <option value="ホラー">ホラー</option>
              <option value="スポーツ">スポーツ</option>
              <option value="レース">レース</option>
              <option value="シューター">シューター</option>
              <option value="その他">その他</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            説明 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.description}
            onChange={e => updateForm("description", e.target.value)}
            required
            rows={5}
            placeholder="ゲームの内容、テストしてほしい内容、参加条件などを記載してください"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
          />
        </div>

        {/* Reward */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            報酬・参加費（円）
          </label>
          <input
            type="number"
            value={form.rewardAmount}
            onChange={e => updateForm("rewardAmount", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            placeholder="0"
          />
          <div className="mt-2 text-xs text-gray-500 space-y-1">
            <p>• 正の数: テスターへの謝礼（例: 500 → テスターに500円）</p>
            <p>• 負の数: 参加費（例: -300 → テスターが300円支払い）</p>
            <p>• 0: 報酬・参加費なし</p>
            {rewardVal !== 0 && (
              <p className="text-purple-600 font-medium">
                プラットフォーム手数料: ¥{platformFee.toLocaleString()}（{rewardVal > 0 ? "謝礼の" : "参加費の"}10%）
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              最大人数 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.maxPlayers}
              onChange={e => updateForm("maxPlayers", e.target.value)}
              required
              min="1"
              max="100"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              締切日（任意）
            </label>
            <input
              type="datetime-local"
              value={form.deadline}
              onChange={e => updateForm("deadline", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            募集形式 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${form.recruitmentType === "first-come" ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-gray-300"}`}>
              <input
                type="radio"
                value="first-come"
                checked={form.recruitmentType === "first-come"}
                onChange={e => updateForm("recruitmentType", e.target.value)}
                className="mt-1"
              />
              <div>
                <div className="font-semibold text-gray-800">⚡ 先着順</div>
                <div className="text-xs text-gray-500 mt-1">応募した順に自動承認</div>
              </div>
            </label>
            <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${form.recruitmentType === "selective" ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-gray-300"}`}>
              <input
                type="radio"
                value="selective"
                checked={form.recruitmentType === "selective"}
                onChange={e => updateForm("recruitmentType", e.target.value)}
                className="mt-1"
              />
              <div>
                <div className="font-semibold text-gray-800">🔍 選考型</div>
                <div className="text-xs text-gray-500 mt-1">手動で応募者を審査・承認</div>
              </div>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            チャット形式 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "thread", label: "スレッド型", desc: "全員が見られる", icon: "💬" },
              { value: "private", label: "個人チャット", desc: "1対1のメッセージ", icon: "🔒" },
              { value: "both", label: "両方", desc: "スレッドと個人", icon: "📨" },
            ].map(opt => (
              <label key={opt.value} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-colors text-center ${form.chatType === opt.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                <input
                  type="radio"
                  value={opt.value}
                  checked={form.chatType === opt.value}
                  onChange={e => updateForm("chatType", e.target.value)}
                  className="hidden"
                />
                <span className="text-2xl">{opt.icon}</span>
                <div className="font-semibold text-gray-800 text-sm">{opt.label}</div>
                <div className="text-xs text-gray-500">{opt.desc}</div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 border-2 border-gray-300 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "作成中..." : "募集を作成"}
          </button>
        </div>
      </form>
    </div>
  )
}
