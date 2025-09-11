import { createClient } from "@/lib/supabase/server"
import BoardPosts from "@/components/board-posts"
import { Header } from "@/components/header"

export default async function BoardPage() {
  const supabase = await createClient()

  const { data } = await supabase.auth.getUser()
  const user = data?.user || null

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">사진게시판</h1>
          <BoardPosts user={user} />
        </div>
      </div>
    </div>
  )
}
