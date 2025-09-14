"use client"

import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useAuth } from "@/components/auth/auth-provider"
import { UserPlus, UserMinus, MessageSquare } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "@/hooks/use-toast"

interface Profile {
  id: string
  username: string
  display_name: string
  bio?: string
  avatar_url?: string
  created_at: string
}

interface UserProfileProps {
  userId: string
  onClose?: () => void
}

export default function UserProfile({ userId, onClose }: UserProfileProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [postCount, setPostCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  const fetchProfile = async () => {
    try {
      // Get profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (profileError) throw profileError
      setProfile(profileData)

      // Get follower count
      const { count: followerCount } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userId)

      setFollowerCount(followerCount || 0)

      // Get following count
      const { count: followingCount } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", userId)

      setFollowingCount(followingCount || 0)

      // Get post count
      const { count: postCount } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("author_id", userId)

      setPostCount(postCount || 0)

      // Check if current user is following this profile
      if (user && user.id !== userId) {
        const { data: followData } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", user.id)
          .eq("following_id", userId)
          .single()

        setIsFollowing(!!followData)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!user || user.id === userId || isFollowLoading) return

    setIsFollowLoading(true)
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase.from("follows").delete().match({
          follower_id: user.id,
          following_id: userId,
        })
        if (error) throw error
        setIsFollowing(false)
        setFollowerCount((prev) => prev - 1)
        toast({
          title: "Unfollowed",
          description: `You are no longer following ${profile?.display_name}`,
        })
      } else {
        // Follow
        const { error } = await supabase.from("follows").insert({
          follower_id: user.id,
          following_id: userId,
        })
        if (error) throw error
        setIsFollowing(true)
        setFollowerCount((prev) => prev + 1)
        toast({
          title: "Following",
          description: `You are now following ${profile?.display_name}`,
        })
      }
    } catch (error) {
      console.error("Error toggling follow:", error)
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsFollowLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [userId, user])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading profile...</div>
        </CardContent>
      </Card>
    )
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Profile not found</div>
        </CardContent>
      </Card>
    )
  }

  const isOwnProfile = user?.id === userId

  return (
    <Card>
      <CardHeader className="text-center">
        <Avatar className="w-24 h-24 mx-auto mb-4">
          <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
          <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
            {profile.display_name?.charAt(0)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-bold">{profile.display_name}</h2>
        <p className="text-muted-foreground">@{profile.username}</p>
        {profile.bio && <p className="text-sm mt-2">{profile.bio}</p>}
      </CardHeader>
      <CardContent>
        <div className="flex justify-center gap-6 mb-6">
          <div className="text-center">
            <div className="font-bold text-lg">{postCount}</div>
            <div className="text-xs text-muted-foreground">Posts</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">{followerCount}</div>
            <div className="text-xs text-muted-foreground">Followers</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">{followingCount}</div>
            <div className="text-xs text-muted-foreground">Following</div>
          </div>
        </div>

        {!isOwnProfile && user && (
          <div className="flex gap-2">
            <Button
              onClick={handleFollow}
              disabled={isFollowLoading}
              className={`flex-1 ${
                isFollowing ? "bg-gray-200 text-gray-800 hover:bg-gray-300" : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isFollowing ? (
                <>
                  <UserMinus className="w-4 h-4 mr-2" />
                  Unfollow
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Follow
                </>
              )}
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              <MessageSquare className="w-4 h-4 mr-2" />
              Message
            </Button>
          </div>
        )}

        {onClose && (
          <Button variant="outline" onClick={onClose} className="w-full mt-4 bg-transparent">
            Close
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
