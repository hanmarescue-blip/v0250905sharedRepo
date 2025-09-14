import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CommunityGroups from "@/components/community-groups"
import { Header } from "@/components/header"

export const dynamic = "force-dynamic"

export default async function CommunityPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/signin")
  }

  // 활성 커뮤니티 그룹 가져오기
  const { data: groups } = await supabase
    .from("community_groups")
    .select(`
      *,
      group_memberships (
        user_id
      )
    `)
    .order("created_at", { ascending: false })

  // 사용자가 가입한 그룹 ID 목록
  const { data: userGroups } = await supabase.from("group_memberships").select("group_id").eq("user_id", user.id)

  const userGroupIds = userGroups?.map((ug) => ug.group_id) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-8">
      <Header />

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">동호회 게시판</h1>
          <p className="text-lg text-gray-600">관심사가 같은 사람들과 함께 동호회를 만들어보세요</p>
          <div className="mt-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
            <p className="text-yellow-800 font-medium">팀 구성과 팀 미팅 기능이 추가되었습니다.</p>
          </div>
        </div>

        <CommunityGroups groups={groups || []} userGroupIds={userGroupIds} userId={user.id} />
      </div>
    </div>
  )
}
