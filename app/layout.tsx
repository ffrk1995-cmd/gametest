import type { Metadata } from "next"
import "./globals.css"
import SessionProvider from "@/components/SessionProvider"
import NavBar from "@/components/NavBar"

export const metadata: Metadata = {
  title: {
    default: "IndiePort — インディーゲーム テストプレイヤー募集",
    template: "%s | IndiePort",
  },
  description: "インディーゲーム開発者とテストプレイヤーをつなぐ専用プラットフォーム。報酬付き募集・先着順/選考型・チャット機能・5段階評価対応。",
  keywords: ["インディーゲーム", "テストプレイ", "ゲームテスター", "バグ報告", "ゲーム開発"],
  openGraph: {
    type: "website",
    siteName: "IndiePort",
    title: "IndiePort — インディーゲーム テストプレイヤー募集",
    description: "インディーゲーム開発者とテストプレイヤーをつなぐ専用プラットフォーム",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "IndiePort — インディーゲーム テストプレイヤー募集",
    description: "インディーゲーム開発者とテストプレイヤーをつなぐ専用プラットフォーム",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <SessionProvider>
          <NavBar />
          <main className="flex-1">
            {children}
          </main>
          <footer className="bg-gray-800 text-gray-400 py-8 text-sm">
            <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="font-bold text-white">🎮 IndiePort</p>
              <p>&copy; 2026 IndiePort. All rights reserved.</p>
              <div className="flex gap-4">
                <a href="mailto:support@indieport-games.com" className="hover:text-white transition-colors">お問い合わせ</a>
                <a href="/terms" className="hover:text-white transition-colors">利用規約</a>
                <a href="/privacy" className="hover:text-white transition-colors">プライバシー</a>
              </div>
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  )
}
