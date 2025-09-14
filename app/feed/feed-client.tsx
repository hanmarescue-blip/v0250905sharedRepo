"use client"

import CreatePost from "@/components/posts/create-post"
import PersonalizedFeed from "@/components/feed/personalized-feed"
import SearchBar from "@/components/search/search-bar"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, Search, Bell, Mail, LogOut, User } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function FeedClient() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handlePostCreated = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/auth/login")
  }

  const goToProfile = () => {
    if (user) {
      router.push(`/profile/${user.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600">SocialApp</h1>

            {/* Search Bar - Desktop */}
            <div className="hidden md:block">
              <SearchBar />
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-blue-600">
                <Home className="w-4 h-4" />
                Home
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Explore
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Messages
              </Button>
            </nav>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={goToProfile} className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                    {user?.email?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">Profile</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>

          {/* Search Bar - Mobile */}
          <div className="md:hidden mt-3">
            <SearchBar />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <CreatePost onPostCreated={handlePostCreated} />
        <PersonalizedFeed refreshTrigger={refreshTrigger} />
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-around">
          <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 text-blue-600">
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1">
            <Search className="w-5 h-5" />
            <span className="text-xs">Search</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1">
            <Bell className="w-5 h-5" />
            <span className="text-xs">Alerts</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={goToProfile} className="flex flex-col items-center gap-1">
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </nav>
    </div>
  )
}
