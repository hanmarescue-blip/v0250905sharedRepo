"use client"

import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-provider"
import PostCard from "./post-card"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

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

interface PostListProps {
  refreshTrigger?: number
}

export default function PostList({ refreshTrigger }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts_with_details")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) throw error

      // Check which posts the current user has liked
      if (user && data) {
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
      } else {
        setPosts(data || [])
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [user, refreshTrigger])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No posts yet. Be the first to share something!</p>
      </div>
    )
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onUpdate={fetchPosts} />
      ))}
    </div>
  )
}
