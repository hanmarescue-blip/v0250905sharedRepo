import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import GroupDetails from "@/components/group-details"

interface GroupPageProps {
  params: { id: string }
}

export default async function GroupPage({ params }: GroupPageProps) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/signin")
  }

  // 그룹 정보 가져오기
  const { data: group } = await supabase
    .from("community_groups")
    .select(`
      *,
      group_members (
        user_id,
        joined_at
      )
    `)
    .eq("id", params.id)
    .eq("is_active", true)
    .single()

  if (!group) {
    notFound()
  }

  // 사용자가 이 그룹의 멤버인지 확인
  const isMember = group.group_members.some((member) => member.user_id === user.id)

  if (!isMember) {
    redirect("/community")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <GroupDetails group={group} currentUserId={user.id} />
      </div>
    </div>
  )
}
