"use client"

import { Button } from "@/components/ui/button"
import { Camera, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"

type User = {
  email: string
  name?: string
  picture?: string
  id: string
}

export function Header() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log("[v0] Checking user session...")
        if (!isSupabaseConfigured) {
          console.log("[v0] Supabase not configured, skipping auth check")
          setLoading(false)
          return
        }

        const {
          data: { user: supabaseUser },
        } = await supabase.auth.getUser()
        console.log("[v0] Supabase user session:", supabaseUser)

        if (supabaseUser) {
          setUser({
            email: supabaseUser.email || "",
            name: supabaseUser.user_metadata?.name,
            picture: supabaseUser.user_metadata?.picture,
            id: supabaseUser.id,
          })
        }
      } catch (error) {
        console.error("[v0] Error checking user:", error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    if (!isSupabaseConfigured) {
      return
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[v0] Auth state changed:", event, session?.user?.email)
      if (session?.user) {
        setUser({
          email: session.user.email || "",
          name: session.user.user_metadata?.name,
          picture: session.user.user_metadata?.picture,
          id: session.user.id,
        })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleHomeClick = () => {
    router.push("/")
  }

  const handleGoogleSignIn = async () => {
    console.log("[v0] Google sign in button clicked")

    if (!isSupabaseConfigured) {
      alert("로그인 기능이 설정되지 않았습니다. 관리자에게 문의하세요.")
      return
    }

    try {
      console.log("[v0] Starting Supabase Google OAuth...")
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error("[v0] Supabase OAuth error:", error)
        alert("로그인 중 오류가 발생했습니다. 다시 시도해주세요.")
      }
    } catch (error) {
      console.error("[v0] Error during Google sign in:", error)
      alert("로그인 중 오류가 발생했습니다. 다시 시도해주세요.")
    }
  }

  const handleSignOut = async () => {
    if (!isSupabaseConfigured) {
      return
    }

    try {
      console.log("[v0] Signing out...")
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("[v0] Sign out error:", error)
      } else {
        setUser(null)
        console.log("[v0] Sign out successful")
      }
    } catch (error) {
      console.error("[v0] Error signing out:", error)
    }
  }

  return (
    <header className="w-full bg-card border-b border-border px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="lg"
            className="text-2xl font-bold p-2 hover:bg-orange-50 transition-colors"
            onClick={handleHomeClick}
          >
            <span className="text-orange-500 font-bold">공유공간</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={() => router.push("/spaces")}>
            <Camera className="w-4 h-4" />
            공간 안내
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={() => router.push("/board")}>
            <Users className="w-4 h-4" />
            사진게시판
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => router.push("/community")}
          >
            <Users className="w-4 h-4" />
            동호회 게시판
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {loading ? (
            <Button variant="outline" size="sm" disabled>
              로딩중...
            </Button>
          ) : user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                로그아웃
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-transparent"
              onClick={handleGoogleSignIn}
            >
              구글 로그인
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
