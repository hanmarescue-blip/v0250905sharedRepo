"use client"

import { Button } from "@/components/ui/button"
import { Camera, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

type User = {
  email: string
  name?: string
  picture?: string
  id: string
}

export function Header() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  const handleHomeClick = () => {
    router.push("/")
  }

  const handleGoogleSignIn = async () => {
    console.log("[v0] Google sign in button clicked")
    router.push("/auth/signin")
  }

  const handleSignOut = async () => {
    console.log("[v0] Sign out clicked")
    setUser(null)
    router.push("/")
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
              <span className="text-sm text-muted-foreground">{user.email.split("@")[0]}</span>
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
