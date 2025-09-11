"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function SignInPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      if (!supabase) return

      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        router.push("/")
      }
    }
    checkSession()
  }, [router, supabase])

  const handleGoogleSignIn = async () => {
    console.log("[v0] Starting Google sign in")
    console.log("[v0] Supabase client:", !!supabase)

    if (!supabase) {
      console.log("[v0] Supabase client not available")
      alert("인증 서비스가 설정되지 않았습니다.")
      return
    }

    setLoading(true)
    try {
      console.log("[v0] Attempting OAuth with redirect:", `${window.location.origin}/auth/callback`)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      console.log("[v0] OAuth response:", { data, error })

      if (error) {
        console.error("[v0] Google 로그인 오류:", error)
        alert(`로그인 오류: ${error.message}`)
      }
    } catch (error) {
      console.error("[v0] 로그인 예외:", error)
      alert("로그인 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-md mx-auto px-4 py-16">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">로그인</CardTitle>
            <CardDescription>공유공간 서비스를 이용하려면 로그인이 필요합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleGoogleSignIn} className="w-full" size="lg" disabled={loading}>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              로그인하면 서비스 이용약관 및 개인정보처리방침에 동의하는 것으로 간주됩니다.
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
