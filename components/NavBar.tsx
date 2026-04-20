"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useState } from "react"

export default function NavBar() {
  const { data: session, status } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-gradient-to-r from-purple-700 to-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold tracking-tight hover:text-purple-200 transition-colors">
              🎮 IndiePort
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <Link href="/recruitments" className="text-sm hover:text-purple-200 transition-colors font-medium">
                募集一覧
              </Link>
              {session && (
                <>
                  <Link href="/recruitments/new" className="text-sm hover:text-purple-200 transition-colors font-medium">
                    募集作成
                  </Link>
                  <Link href="/dashboard" className="text-sm hover:text-purple-200 transition-colors font-medium">
                    ダッシュボード
                  </Link>
                </>
              )}
              <Link href="/premium" className="text-sm bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full font-bold hover:bg-yellow-300 transition-colors">
                プレミアム
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {status === "loading" ? (
              <span className="text-sm text-purple-200">読み込み中...</span>
            ) : session ? (
              <>
                <span className="text-sm text-purple-200">{session.user.name}</span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm hover:text-purple-200 transition-colors">
                  ログイン
                </Link>
                <Link href="/auth/register" className="text-sm bg-white text-purple-700 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors">
                  新規登録
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/20 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-2">
            <Link href="/recruitments" className="block py-2 text-sm hover:text-purple-200" onClick={() => setMenuOpen(false)}>
              募集一覧
            </Link>
            {session && (
              <>
                <Link href="/recruitments/new" className="block py-2 text-sm hover:text-purple-200" onClick={() => setMenuOpen(false)}>
                  募集作成
                </Link>
                <Link href="/dashboard" className="block py-2 text-sm hover:text-purple-200" onClick={() => setMenuOpen(false)}>
                  ダッシュボード
                </Link>
              </>
            )}
            <Link href="/premium" className="block py-2 text-sm font-bold text-yellow-300" onClick={() => setMenuOpen(false)}>
              プレミアム
            </Link>
            <hr className="border-white/20 my-1" />
            {session ? (
              <>
                <span className="text-sm text-purple-200">{session.user.name}</span>
                <button
                  onClick={() => { signOut({ callbackUrl: "/" }); setMenuOpen(false) }}
                  className="text-left text-sm hover:text-purple-200"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block py-2 text-sm hover:text-purple-200" onClick={() => setMenuOpen(false)}>
                  ログイン
                </Link>
                <Link href="/auth/register" className="block py-2 text-sm hover:text-purple-200" onClick={() => setMenuOpen(false)}>
                  新規登録
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
