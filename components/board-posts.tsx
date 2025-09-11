"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Trash2, X } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import Link from "next/link"

interface Photo {
  id: string
  filename: string
  original_filename: string
  public_url: string
  file_size: number
  mime_type: string
  width?: number
  height?: number
}

interface BoardPost {
  id: number
  title: string
  content: string
  author_id: string
  created_at: string
  author_email?: string
  photos?: Photo[]
}

interface BoardPostsProps {
  user: User | null // null 허용으로 변경
}

export default function BoardPosts({ user }: BoardPostsProps) {
  const [posts, setPosts] = useState<BoardPost[]>([])
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [photos, setPhotos] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPost, setSelectedPost] = useState<BoardPost | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    setIsLoading(true)
    try {
      console.log("[v0] Starting to load posts...")

      const { data: postsData, error: postsError } = await supabase
        .from("board_posts")
        .select("*")
        .order("created_at", { ascending: false })

      console.log("[v0] Posts query result:", { postsData, postsError })

      if (postsError) {
        console.error("[v0] Error loading posts:", postsError)
        throw postsError
      }

      if (!postsData || postsData.length === 0) {
        console.log("[v0] No posts found in database")
        setPosts([])
        return
      }

      const postsWithPhotos = await Promise.all(
        postsData.map(async (post) => {
          console.log("[v0] Processing post:", post.id)

          // Get author email from auth.users
          const { data: userData, error: userError } = await supabase
            .from("auth.users")
            .select("email")
            .eq("id", post.author_id)
            .single()

          if (userError) {
            console.log("[v0] Could not fetch user data:", userError)
          }

          // Get photos for this post
          const { data: photoData, error: photoError } = await supabase
            .from("board_post_photos")
            .select(`
              photos (
                id,
                filename,
                original_filename,
                public_url,
                file_size,
                mime_type,
                width,
                height
              )
            `)
            .eq("board_post_id", post.id)
            .order("display_order", { ascending: true })

          if (photoError) {
            console.log("[v0] Error loading photos for post", post.id, ":", photoError)
          }

          const photos = photoData?.map((item) => item.photos).filter(Boolean) || []
          console.log("[v0] Photos for post", post.id, ":", photos)

          return {
            ...post,
            author_email: userData?.email?.split("@")[0] || "Unknown User",
            photos,
          }
        }),
      )

      console.log("[v0] Final posts with photos:", postsWithPhotos)
      setPosts(postsWithPhotos)
    } catch (error) {
      console.error("[v0] Error in loadPosts:", error)
      setPosts([]) // Set empty array on error to show "no posts" message
    } finally {
      setIsLoading(false)
    }
  }

  const uploadPhotos = async (files: File[]): Promise<Photo[]> => {
    if (!user) return [] // user가 null인 경우 빈 배열 반환

    const uploadedPhotos: Photo[] = []

    for (const file of files) {
      try {
        const fileExt = file.name.split(".").pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage.from("board-photos").upload(filePath, file)

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from("board-photos").getPublicUrl(filePath)

        const { data: photoData, error: photoError } = await supabase
          .from("photos")
          .insert({
            filename: fileName,
            original_filename: file.name,
            file_size: file.size,
            mime_type: file.type,
            storage_path: filePath,
            public_url: data.publicUrl,
            uploaded_by: user.id,
          })
          .select()
          .single()

        if (photoError) throw photoError

        uploadedPhotos.push(photoData)
        console.log("[v0] Uploaded photo:", photoData)
      } catch (error) {
        console.error("Error uploading photo:", error)
      }
    }

    return uploadedPhotos
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !title.trim() || !content.trim()) return // user 체크 추가

    setIsSubmitting(true)
    try {
      const { data: postData, error: postError } = await supabase
        .from("board_posts")
        .insert({
          title: title.trim(),
          content: content.trim(),
          author_id: user.id,
        })
        .select()
        .single()

      if (postError) throw postError

      // Upload photos if any
      if (photos.length > 0) {
        const uploadedPhotos = await uploadPhotos(photos)

        // Link photos to post
        const photoLinks = uploadedPhotos.map((photo, index) => ({
          board_post_id: postData.id,
          photo_id: photo.id,
          display_order: index,
        }))

        const { error: linkError } = await supabase.from("board_post_photos").insert(photoLinks)

        if (linkError) throw linkError
      }

      setTitle("")
      setContent("")
      setPhotos([])
      const fileInput = document.getElementById("photos") as HTMLInputElement
      if (fileInput) fileInput.value = ""

      await loadPosts()
    } catch (error) {
      console.error("Error creating post:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setPhotos(files)
  }

  const handleDeletePost = async (postId: number) => {
    if (!user || !confirm("정말로 이 게시글을 삭제하시겠습니까?")) return // user 체크 추가

    setIsDeleting(true)
    try {
      const { error } = await supabase.from("board_posts").delete().eq("id", postId).eq("author_id", user.id)

      if (error) throw error

      setSelectedPost(null)
      await loadPosts()
    } catch (error) {
      console.error("Error deleting post:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCardClick = (post: BoardPost) => {
    setSelectedPost(post)
  }

  return (
    <div className="space-y-8">
      {user ? (
        <Card>
          <CardHeader>
            <CardTitle>새 게시글 작성</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="게시글 제목을 입력하세요"
                  required
                />
              </div>

              <div>
                <Label htmlFor="content">내용</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="게시글 내용을 입력하세요"
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="photos">사진 업로드 (여러 장 선택 가능)</Label>
                <Input
                  id="photos"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotosChange}
                  className="cursor-pointer"
                />
                {photos.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1">선택된 파일: {photos.map((f) => f.name).join(", ")}</p>
                )}
              </div>

              <Button type="submit" disabled={isSubmitting || !title.trim() || !content.trim()} className="w-full">
                {isSubmitting ? "게시글 작성 중..." : "게시글 작성"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600 mb-4">게시글을 작성하려면 로그인이 필요합니다.</p>
            <Link href="/auth/signin">
              <Button>로그인하기</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">게시글 목록</h2>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">게시글을 불러오는 중...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">아직 게시글이 없습니다. 첫 번째 게시글을 작성해보세요!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md hover:-translate-y-1"
                onClick={() => handleCardClick(post)}
              >
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  {post.photos && post.photos.length > 0 ? (
                    <>
                      <img
                        src={post.photos[0].public_url || "/placeholder.svg"}
                        alt={post.photos[0].original_filename}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          console.log("[v0] Image failed to load:", post.photos?.[0]?.public_url)
                          e.currentTarget.src = "/abstract-geometric-shapes.png"
                        }}
                      />
                      {/* Photo count overlay */}
                      {post.photos.length > 1 && (
                        <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                          +{post.photos.length - 1}
                        </div>
                      )}
                      {/* Gradient overlay for better text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mb-2">
                        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <span className="text-gray-500 text-sm font-medium">사진 없음</span>
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 text-base leading-tight group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{post.content}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500 font-medium">{post.author_email}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(post.created_at).toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedPost && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">{selectedPost.title}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-600 border-b pb-2">
                  <span>작성자: {selectedPost.author_email}</span>
                  <span>
                    {new Date(selectedPost.created_at).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="flex justify-end gap-2">
                  {user && selectedPost.author_id === user.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePost(selectedPost.id)}
                      disabled={isDeleting}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setSelectedPost(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {selectedPost.photos && selectedPost.photos.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">사진 ({selectedPost.photos.length}장)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedPost.photos.map((photo, index) => (
                        <div key={photo.id} className="space-y-2">
                          <img
                            src={photo.public_url || "/placeholder.svg"}
                            alt={photo.original_filename}
                            className="w-full h-auto rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src = "/abstract-geometric-shapes.png"
                            }}
                          />
                          <p className="text-xs text-gray-500">{photo.original_filename}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="prose max-w-none">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedPost.content}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
