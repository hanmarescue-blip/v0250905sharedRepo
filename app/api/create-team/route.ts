import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { name, leader_id, member_ids } = await request.json()

    console.log("[v0] Creating team with:", { name, leader_id, member_ids })

    // Create team
    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .insert({
        name,
        leader_id,
        status: "pending",
      })
      .select()
      .single()

    if (teamError) {
      console.error("[v0] Team creation error:", teamError)
      return NextResponse.json({ error: teamError.message }, { status: 400 })
    }

    console.log("[v0] Team created:", teamData)

    // Add leader as confirmed member
    const { error: leaderError } = await supabase.from("team_members").insert({
      team_id: teamData.id,
      user_id: leader_id,
      role: "leader",
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
    })

    if (leaderError) {
      console.error("[v0] Leader member error:", leaderError)
      return NextResponse.json({ error: leaderError.message }, { status: 400 })
    }

    // Add other members as pending
    const memberInserts = member_ids.map((user_id: string) => ({
      team_id: teamData.id,
      user_id,
      role: "member",
      status: "pending",
    }))

    const { error: membersError } = await supabase.from("team_members").insert(memberInserts)

    if (membersError) {
      console.error("[v0] Members error:", membersError)
      return NextResponse.json({ error: membersError.message }, { status: 400 })
    }

    // Create invitations
    const invitationInserts = member_ids.map((user_id: string) => ({
      team_id: teamData.id,
      inviter_id: leader_id,
      invitee_id: user_id,
      status: "pending",
    }))

    const { error: invitationsError } = await supabase.from("team_invitations").insert(invitationInserts)

    if (invitationsError) {
      console.error("[v0] Invitations error:", invitationsError)
      return NextResponse.json({ error: invitationsError.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      team: teamData,
    })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
