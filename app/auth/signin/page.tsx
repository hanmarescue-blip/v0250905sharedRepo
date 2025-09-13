"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignInPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    console.log("[v0] Starting Google sign in")
    setLoading(true)

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

      if (!supabaseUrl) {
        alert("인증 서비스가 설정되지 않았습니다.")
        return
      }

      const redirectTo = `${window.location.origin}/auth/callback`
      const oauthUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`

      console.log("[v0] Redirecting to OAuth URL:", oauthUrl)
      window.location.href = oauthUrl
    } catch (error) {
      console.error("[v0] 로그인 예외:", error)
      alert("로그인 중 오류가 발생했습니다.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-orange-500 mb-2">공유공간</h1>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">로그인</h2>
            <p className="text-gray-600">공유공간 서비스를 이용하려면 로그인이 필요합니다.</p>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading ? "로그인 중..." : "구글로 로그인"}
          </button>

          <div className="text-center text-sm text-gray-500 mt-6">
            로그인하면 서비스 이용약관 및 개인정보처리방침에 동의하는 것으로 간주됩니다.
          </div>
        </div>
      </div>
    </div>
  )
}
