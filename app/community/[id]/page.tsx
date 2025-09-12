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

  console.log("[v0] Fetching club data for ID:", params.id)

  // 동호회 정보 가져오기
  const { data: club, error } = await supabase
    .from("community_groups")
    .select(`
      *,
      group_members:group_memberships (
        user_id,
        joined_at
      )
    `)
    .eq("id", params.id)
    .single()

  console.log("[v0] Club data:", club)
  console.log("[v0] Club error:", error)

  if (!club) {
    console.log("[v0] Club not found, redirecting to 404")
    notFound()
  }

  // 사용자가 이 동호회의 멤버인지 확인
  const memberships = club.group_members || []
  console.log("[v0] Memberships:", memberships)

  const isMember = memberships.some((member) => member.user_id === user.id)
  console.log("[v0] Is member:", isMember)

  if (!isMember) {
    console.log("[v0] User is not a member, redirecting to community")
    redirect("/community")
  }

  return <ClubLayout club={club} currentUserId={user.id} />
}
