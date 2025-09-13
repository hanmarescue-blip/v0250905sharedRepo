import { createAdminClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { searchName } = await request.json()

    if (!searchName || !searchName.trim()) {
      return NextResponse.json({ users: [] })
    }

    console.log("[v0] Server: Searching for user:", searchName.trim())

    const adminClient = createAdminClient()
    const { data: authUsers, error: listError } = await adminClient.auth.admin.listUsers()

    if (listError) {
      console.error("[v0] Server: Error listing users:", listError)
      return NextResponse.json({ error: "Failed to search users" }, { status: 500 })
    }

    console.log("[v0] Server: Found total users:", authUsers?.users?.length || 0)

    if (!authUsers?.users) {
      return NextResponse.json({ users: [] })
    }

    const searchTerm = searchName.trim().toLowerCase()

    // First search by display name
    const displayNameMatches = authUsers.users.filter((user) => {
      const displayName = user.user_metadata?.display_name || user.user_metadata?.name
      return displayName && displayName.toLowerCase().includes(searchTerm)
    })

    console.log("[v0] Server: Display name matches:", displayNameMatches.length)

    if (displayNameMatches.length > 0) {
      const results = displayNameMatches.map((user) => ({
        id: user.id,
        name: user.user_metadata?.display_name || user.user_metadata?.name || user.email?.split("@")[0] || "",
        email: user.email || "",
        emailPrefix: (user.email || "").split("@")[0],
      }))

      return NextResponse.json({ users: results })
    }

    // If no display name matches, search by email prefix
    console.log("[v0] Server: No display name matches, searching by email prefix...")
    const emailPrefixMatches = authUsers.users.filter((user) => {
      const emailPrefix = (user.email || "").split("@")[0]
      return emailPrefix.toLowerCase() === searchTerm
    })

    console.log("[v0] Server: Email prefix matches:", emailPrefixMatches.length)

    const results = emailPrefixMatches.map((user) => ({
      id: user.id,
      name: user.user_metadata?.display_name || user.user_metadata?.name || user.email?.split("@")[0] || "",
      email: user.email || "",
      emailPrefix: (user.email || "").split("@")[0],
    }))

    return NextResponse.json({ users: results })
  } catch (error) {
    console.error("[v0] Server: Error in search-users API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
