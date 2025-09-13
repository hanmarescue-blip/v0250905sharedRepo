import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id")

    if (!user_id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get pending team invitations for the user
    const { data: invitations, error } = await supabase
      .from("team_invitations")
      .select(`
        id,
        team_id,
        inviter_id,
        status,
        created_at,
        teams (
          id,
          name,
          leader_id
        ),
        inviter:profiles!inviter_id (
          id,
          display_name,
          email
        )
      `)
      .eq("invitee_id", user_id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Notifications fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      notifications: invitations || [],
    })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
