import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import ClubLayout from "@/components/club-layout"

interface ClubPageProps {
  params: { id: string }
}

export default async function ClubPage({ params }: ClubPageProps) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/signin")
  }

  // 동호회 정보 가져오기
  const { data: club } = await supabase
    .from("community_groups")
    .select(`
      *,
      group_memberships (
        user_id
      )
    `)
    .eq("id", params.id)
    .single()

  if (!club) {
    notFound()
  }

  // 사용자가 이 동호회의 멤버인지 확인
  const isMember = club.group_memberships.some((member) => member.user_id === user.id)

  if (!isMember) {
    redirect("/community")
  }

  return <ClubLayout club={club} currentUserId={user.id} />
}
