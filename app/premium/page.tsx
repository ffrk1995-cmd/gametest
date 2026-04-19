"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"

export default function PremiumPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  async function handleSubscribe() {
    if (!session) return
    setLoading(true)
    setError("")
    const res = await fetch("/api/checkout", { method: "POST" })
    const data = await res.json()
    setLoading(false)
    if (res.ok && data.url) {
      window.location.href = data.url
    } else {
      setError(data.error || "決済の準備に失敗しました")
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="text-6xl mb-4">👑</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-3">プレミアム会員</h1>
        <p className="text-xl text-gray-500">より充実した機能で、ゲームテストを次のレベルへ</p>
      </div>

      {/* Price Card */}
      <div className="max-w-md mx-auto mb-12">
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-1 shadow-2xl">
          <div className="bg-white rounded-3xl p-8 text-center">
            <div className="text-sm font-semibold text-purple-600 uppercase tracking-wider mb-2">月額プラン</div>
            <div className="text-6xl font-bold text-gray-800 mb-1">¥980</div>
            <div className="text-gray-500 mb-6">/月（税込）</div>

            {success ? (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl font-medium">
                プレミアム会員登録が完了しました！
              </div>
            ) : !session ? (
              <Link
                href="/auth/login"
                className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity"
              >
                ログインして登録
              </Link>
            ) : (
              <>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
                    {error}
                  </div>
                )}
                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "処理中..." : "今すぐ登録する"}
                </button>
                <p className="text-xs text-gray-400 mt-3">Stripeの安全な決済画面に移動します</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">プレミアム特典</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              icon: "🔝",
              title: "優先表示",
              desc: "あなたの募集が一覧ページの上位に表示されます。より多くのテスターに届けましょう。",
            },
            {
              icon: "🔍",
              title: "高度な検索・フィルター",
              desc: "ジャンル、報酬、プラットフォームなど細かい条件での絞り込み検索が使えます。",
            },
            {
              icon: "📊",
              title: "詳細な統計情報",
              desc: "募集の閲覧数、応募数の推移など詳細な分析データを確認できます。",
            },
            {
              icon: "🏅",
              title: "プレミアムバッジ",
              desc: "プロフィールに「PRO」バッジが表示され、信頼性をアピールできます。",
            },
            {
              icon: "📨",
              title: "無制限のメッセージ",
              desc: "無料会員の制限なく、すべての参加者と自由にチャットできます。",
            },
            {
              icon: "⚡",
              title: "優先サポート",
              desc: "問題が発生した際に優先的にサポートを受けられます。",
            },
          ].map((feature, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex items-start gap-4">
              <div className="text-3xl flex-shrink-0">{feature.icon}</div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-12">
        <div className="bg-gray-50 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-800">無料 vs プレミアム</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-4 text-gray-600 font-medium">機能</th>
                <th className="text-center px-6 py-4 text-gray-600 font-medium">無料</th>
                <th className="text-center px-6 py-4 text-purple-600 font-bold">プレミアム</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                ["テスター募集の作成", "3件まで", "無制限"],
                ["応募", "✓", "✓"],
                ["チャット", "基本機能", "無制限"],
                ["評価システム", "✓", "✓"],
                ["優先表示", "×", "✓"],
                ["PRO バッジ", "×", "✓"],
                ["詳細統計", "×", "✓"],
                ["高度な検索", "×", "✓"],
              ].map(([feature, free, premium], i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-700 text-sm">{feature}</td>
                  <td className="px-6 py-4 text-center text-gray-500 text-sm">{free}</td>
                  <td className="px-6 py-4 text-center text-purple-600 font-medium text-sm">{premium}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">よくある質問</h2>
        <div className="space-y-4">
          {[
            {
              q: "いつでもキャンセルできますか？",
              a: "はい、いつでもキャンセルできます。キャンセル後も有効期限まではプレミアム機能をご利用いただけます。",
            },
            {
              q: "支払い方法は何がありますか？",
              a: "クレジットカード、デビットカードに対応しています（シミュレーションのため実際の課金は発生しません）。",
            },
            {
              q: "無料会員のままでも使えますか？",
              a: "はい、基本的な機能はすべて無料でご利用いただけます。テスター募集の作成・応募・チャット・評価が可能です。",
            },
          ].map((faq, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-2">Q. {faq.q}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">A. {faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
