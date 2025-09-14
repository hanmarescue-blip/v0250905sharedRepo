"use client"

import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-provider"
import PostCard from "@/components/posts/post-card"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Post {
  id: string
  content: string
  image_url?: string
  created_at: string
  author_id: string
  author_username: string
  author_display_name: string
  author_avatar_url?: string
  like_count: number
  comment_count: number
  user_has_liked?: boolean
}

interface PersonalizedFeedProps {
  refreshTrigger?: number
}

export default function PersonalizedFeed({ refreshTrigger }: PersonalizedFeedProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [feedType, setFeedType] = useState<"following" | "all">("following")
  const { user } = useAuth()
  const supabase = createClient()

  const fetchPersonalizedFeed = async () => {
    if (!user) return

    try {
      const query = supabase.from("posts_with_details").select("*").order("created_at", { ascending: false }).limit(20)

      if (feedType === "following") {
        // Get posts from followed users using the database function
        const { data: feedData, error: feedError } = await supabase.rpc("get_user_feed", {
          user_uuid: user.id,
        })

        if (feedError) throw feedError
        setPosts(feedData || [])
      } else {
        // Get all posts
        const { data, error } = await query

        if (error) throw error

        // Check which posts the current user has liked
        if (data) {
          const postIds = data.map((post) => post.id)
          const { data: likes } = await supabase
            .from("likes")
            .select("post_id")
            .eq("user_id", user.id)
            .in("post_id", postIds)

          const likedPostIds = new Set(likes?.map((like) => like.post_id) || [])

          const postsWithLikeStatus = data.map((post) => ({
            ...post,
            user_has_liked: likedPostIds.has(post.id),
          }))

          setPosts(postsWithLikeStatus)
        }
      }
    } catch (error) {
      console.error("Error fetching personalized feed:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPersonalizedFeed()
  }, [user, feedType, refreshTrigger])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div>
      {/* Feed Type Toggle */}
      <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
        <Button
          variant={feedType === "following" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFeedType("following")}
          className={`flex-1 ${feedType === "following" ? "bg-white shadow-sm" : ""}`}
        >
          Following
        </Button>
        <Button
          variant={feedType === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFeedType("all")}
          className={`flex-1 ${feedType === "all" ? "bg-white shadow-sm" : ""}`}
        >
          Discover
        </Button>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {feedType === "following" ? (
            <div>
              <p className="mb-2">No posts from people you follow yet.</p>
              <Button variant="outline" onClick={() => setFeedType("all")} className="bg-transparent">
                Discover new people
              </Button>
            </div>
          ) : (
            <p>No posts yet. Be the first to share something!</p>
          )}
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onUpdate={fetchPersonalizedFeed} />
          ))}
        </div>
      )}
    </div>
  )
}
