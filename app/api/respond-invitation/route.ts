import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { invitation_id, user_id, response } = await request.json()

    if (!invitation_id || !user_id || !response) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!["accepted", "rejected"].includes(response)) {
      return NextResponse.json({ error: "Invalid response" }, { status: 400 })
    }

    // Update invitation status
    const { data: invitation, error: invitationError } = await supabase
      .from("team_invitations")
      .update({
        status: response,
        responded_at: new Date().toISOString(),
      })
      .eq("id", invitation_id)
      .eq("invitee_id", user_id)
      .select("team_id")
      .single()

    if (invitationError) {
      console.error("[v0] Invitation update error:", invitationError)
      return NextResponse.json({ error: invitationError.message }, { status: 400 })
    }

    if (response === "accepted") {
      // Update team member status to confirmed
      const { error: memberError } = await supabase
        .from("team_members")
        .update({
          status: "confirmed",
          confirmed_at: new Date().toISOString(),
        })
        .eq("team_id", invitation.team_id)
        .eq("user_id", user_id)

      if (memberError) {
        console.error("[v0] Member update error:", memberError)
        return NextResponse.json({ error: memberError.message }, { status: 400 })
      }

      // Check if all members have confirmed
      const { data: allMembers, error: membersError } = await supabase
        .from("team_members")
        .select("status")
        .eq("team_id", invitation.team_id)

      if (membersError) {
        console.error("[v0] Members check error:", membersError)
        return NextResponse.json({ error: membersError.message }, { status: 400 })
      }

      // If all members are confirmed, activate the team
      const allConfirmed = allMembers.every((member) => member.status === "confirmed")

      if (allConfirmed) {
        const { error: teamError } = await supabase
          .from("teams")
          .update({ status: "active" })
          .eq("id", invitation.team_id)

        if (teamError) {
          console.error("[v0] Team activation error:", teamError)
          return NextResponse.json({ error: teamError.message }, { status: 400 })
        }
      }
    } else {
      // If rejected, remove the team member entry
      const { error: memberError } = await supabase
        .from("team_members")
        .delete()
        .eq("team_id", invitation.team_id)
        .eq("user_id", user_id)

      if (memberError) {
        console.error("[v0] Member removal error:", memberError)
        return NextResponse.json({ error: memberError.message }, { status: 400 })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Invitation ${response} successfully`,
    })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
