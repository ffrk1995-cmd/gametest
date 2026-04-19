import Link from "next/link"

export default function PremiumSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">プレミアム会員登録完了！</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          ご登録ありがとうございます。<br />
          すべてのプレミアム機能がご利用いただけます。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors"
          >
            ダッシュボードへ
          </Link>
          <Link
            href="/recruitments/new"
            className="bg-white text-purple-600 border-2 border-purple-600 px-6 py-3 rounded-xl font-bold hover:bg-purple-50 transition-colors"
          >
            募集を作成する
          </Link>
        </div>
      </div>
    </div>
  )
}
