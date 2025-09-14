"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth/auth-provider"
import { Send } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"

interface Comment {
  id: string
  content: string
  created_at: string
  author_id: string
  profiles: {
    username: string
    display_name: string
    avatar_url?: string
  }
}

interface CommentSectionProps {
  postId: string
  isOpen: boolean
  onClose: () => void
}

export default function CommentSection({ postId, isOpen, onClose }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  const fetchComments = async () => {
    if (!isOpen) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(
          `
          id,
          content,
          created_at,
          author_id,
          profiles:author_id (
            username,
            display_name,
            avatar_url
          )
        `,
        )
        .eq("post_id", postId)
        .order("created_at", { ascending: true })

      if (error) throw error
      setComments(data || [])
    } catch (error) {
      console.error("Error fetching comments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from("comments").insert({
        content: newComment.trim(),
        post_id: postId,
        author_id: user.id,
      })

      if (error) throw error

      setNewComment("")
      fetchComments() // Refresh comments
      toast({
        title: "Comment added!",
        description: "Your comment has been posted.",
      })
    } catch (error) {
      console.error("Error creating comment:", error)
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [isOpen, postId])

  if (!isOpen) return null

  return (
    <div className="border-t pt-4 mt-4">
      <div className="space-y-4">
        {/* Comments List */}
        {isLoading ? (
          <div className="text-center text-sm text-muted-foreground">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">No comments yet. Be the first to comment!</div>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={comment.profiles?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                    {comment.profiles?.display_name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{comment.profiles?.display_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Comment Form */}
        {user && (
          <form onSubmit={handleSubmitComment} className="flex gap-3">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                {user.email?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex gap-2">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[60px] resize-none text-sm"
                maxLength={300}
              />
              <Button type="submit" size="sm" disabled={!newComment.trim() || isSubmitting}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
