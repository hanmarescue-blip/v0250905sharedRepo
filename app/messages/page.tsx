import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import MessagesList from "@/components/messages-list"

export const dynamic = "force-dynamic"

export default async function MessagesPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/signin")
  }

  // 사용자의 메시지 목록 가져오기 (받은 메시지와 보낸 메시지)
  const { data: messages } = await supabase
    .from("messages")
    .select(`
      *,
      sender:sender_id (
        email
      ),
      receiver:receiver_id (
        email
      )
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false })

  // 커뮤니티 그룹 멤버들 가져오기 (메시지를 보낼 수 있는 사용자들)
  const { data: groupMembers } = await supabase
    .from("group_members")
    .select(`
      user_id,
      community_groups!inner (
        id,
        name
      )
    `)
    .neq("user_id", user.id)

  // 중복 제거하여 연락 가능한 사용자 목록 생성
  const contactableUsers = Array.from(
    new Map(
      groupMembers?.map((member) => [
        member.user_id,
        {
          id: member.user_id,
          email: "", // 실제로는 auth.users에서 가져와야 함
        },
      ]) || [],
    ).values(),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">메시지</h1>
          <p className="text-lg text-gray-600">커뮤니티 멤버들과 소통하세요</p>
        </div>

        <MessagesList messages={messages || []} currentUserId={user.id} contactableUsers={contactableUsers} />
      </div>
    </div>
  )
}
