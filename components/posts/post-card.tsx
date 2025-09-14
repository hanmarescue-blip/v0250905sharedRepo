"use client"

import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useAuth } from "@/components/auth/auth-provider"
import CommentSection from "@/components/comments/comment-section"
import { Heart, MessageCircle, Share, MoreHorizontal } from "lucide-react"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"

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

interface PostCardProps {
  post: Post
  onUpdate?: () => void
}

export default function PostCard({ post, onUpdate }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.user_has_liked || false)
  const [likeCount, setLikeCount] = useState(post.like_count)
  const [showComments, setShowComments] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  const handleLike = async () => {
    if (!user || isLoading) return

    setIsLoading(true)
    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase.from("likes").delete().match({
          user_id: user.id,
          post_id: post.id,
        })
        if (error) throw error
        setIsLiked(false)
        setLikeCount((prev) => prev - 1)
      } else {
        // Like
        const { error } = await supabase.from("likes").insert({
          user_id: user.id,
          post_id: post.id,
        })
        if (error) throw error
        setIsLiked(true)
        setLikeCount((prev) => prev + 1)
      }
      onUpdate?.()
    } catch (error) {
      console.error("Error toggling like:", error)
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleComments = () => {
    setShowComments(!showComments)
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.author_avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {post.author_display_name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{post.author_display_name}</p>
              <p className="text-xs text-muted-foreground">@{post.author_username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm leading-relaxed mb-4">{post.content}</p>
        {post.image_url && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img src={post.image_url || "/placeholder.svg"} alt="Post image" className="w-full h-auto" />
          </div>
        )}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLoading}
              className={`flex items-center gap-2 ${isLiked ? "text-red-500" : "text-muted-foreground"}`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              <span className="text-xs">{likeCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleComments}
              className={`flex items-center gap-2 ${showComments ? "text-blue-500" : "text-muted-foreground"}`}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">{post.comment_count}</span>
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Share className="w-4 h-4" />
          </Button>
        </div>

        <CommentSection postId={post.id} isOpen={showComments} onClose={() => setShowComments(false)} />
      </CardContent>
    </Card>
  )
}
