import Link from "next/link"

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-700 via-purple-600 to-blue-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            インディーゲームの<br />
            テストプレイヤーを<br />
            <span className="text-yellow-300">見つけよう</span>
          </h1>
          <p className="text-xl md:text-2xl text-purple-100 mb-10 leading-relaxed">
            ゲーム開発者とプレイヤーをつなぐ専用プラットフォーム。<br />
            あなたのゲームを一緒に磨き上げましょう。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/recruitments"
              className="bg-white text-purple-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-50 transition-colors shadow-lg"
            >
              募集一覧を見る
            </Link>
            <Link
              href="/auth/register"
              className="bg-yellow-400 text-yellow-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-colors shadow-lg"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">プラットフォームの特徴</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow border border-purple-100">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">多様な募集形式</h3>
            <p className="text-gray-600">先着順・選考型の2種類の募集形式。目的に合わせた最適なテスター募集が可能です。</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow border border-blue-100">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">充実したチャット</h3>
            <p className="text-gray-600">スレッド型チャットと個人チャットで、開発者とプレイヤーがスムーズにコミュニケーションできます。</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow border border-green-100">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">5段階評価システム</h3>
            <p className="text-gray-600">テスト終了後に相互評価。信頼性の高いコミュニティを構築します。</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow border border-yellow-100">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">柔軟な報酬設定</h3>
            <p className="text-gray-600">開発者からテスターへの謝礼、または参加費の両方に対応。10%のプラットフォーム手数料のみ。</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow border border-red-100">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">プレミアム会員</h3>
            <p className="text-gray-600">月額980円で優先表示やフィルター機能など、より充実した機能が利用できます。</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow border border-indigo-100">
            <div className="text-4xl mb-4">🎮</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">あらゆるジャンル対応</h3>
            <p className="text-gray-600">アクション、RPG、パズルなど、あらゆるジャンルのインディーゲームに対応しています。</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gradient-to-br from-purple-50 to-blue-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">使い方</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-bold text-purple-700 mb-6">開発者の方</h3>
              <ol className="space-y-4">
                {[
                  "アカウントを作成する",
                  "ゲーム情報と募集条件を設定",
                  "応募者の中からテスターを選択",
                  "チャットでフィードバックを収集",
                  "テスト終了後に評価を行う",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {i + 1}
                    </span>
                    <span className="text-gray-700 pt-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-700 mb-6">テスタープレイヤーの方</h3>
              <ol className="space-y-4">
                {[
                  "アカウントを作成する",
                  "興味のある募集を見つける",
                  "応募メッセージを送る",
                  "承認されたらゲームをプレイ",
                  "フィードバックを提供して評価を受ける",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {i + 1}
                    </span>
                    <span className="text-gray-700 pt-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">今すぐ始めよう</h2>
          <p className="text-gray-600 mb-8">無料登録で、すべての機能をお試しいただけます。</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity shadow-lg"
            >
              無料アカウントを作成
            </Link>
            <Link
              href="/recruitments"
              className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-50 transition-colors"
            >
              募集を見てみる
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
