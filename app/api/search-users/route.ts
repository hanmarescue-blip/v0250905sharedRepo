import { createAdminClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Server: Starting search-users API")

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    console.log("[v0] Server: Service role key exists:", !!serviceRoleKey)

    if (!serviceRoleKey) {
      console.error("[v0] Server: SUPABASE_SERVICE_ROLE_KEY is missing")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const { searchName } = await request.json()
    console.log("[v0] Server: Received search request for:", searchName)

    if (!searchName || !searchName.trim()) {
      console.log("[v0] Server: Empty search name, returning empty results")
      return NextResponse.json({ users: [] })
    }

    console.log("[v0] Server: Creating admin client...")

    let adminClient
    try {
      adminClient = createAdminClient()
      console.log("[v0] Server: Admin client created successfully")
    } catch (clientError) {
      console.error("[v0] Server: Failed to create admin client:", clientError)
      return NextResponse.json({ error: "Failed to create admin client" }, { status: 500 })
    }

    console.log("[v0] Server: Calling listUsers...")
    const { data: authUsers, error: listError } = await adminClient.auth.admin.listUsers()

    if (listError) {
      console.error("[v0] Server: Error listing users:", listError)
      return NextResponse.json({ error: "Failed to search users" }, { status: 500 })
    }

    console.log("[v0] Server: Found total users:", authUsers?.users?.length || 0)

    if (!authUsers?.users) {
      console.log("[v0] Server: No users found in response")
      return NextResponse.json({ users: [] })
    }

    const searchTerm = searchName.trim().toLowerCase()
    console.log("[v0] Server: Searching for term:", searchTerm)

    // First search by display name
    const displayNameMatches = authUsers.users.filter((user) => {
      const displayName = user.user_metadata?.display_name || user.user_metadata?.name
      const matches = displayName && displayName.toLowerCase().includes(searchTerm)
      if (matches) {
        console.log("[v0] Server: Display name match found:", displayName)
      }
      return matches
    })

    console.log("[v0] Server: Display name matches:", displayNameMatches.length)

    if (displayNameMatches.length > 0) {
      const results = displayNameMatches.map((user) => ({
        id: user.id,
        name: user.user_metadata?.display_name || user.user_metadata?.name || user.email?.split("@")[0] || "",
        email: user.email || "",
        emailPrefix: (user.email || "").split("@")[0],
      }))

      console.log("[v0] Server: Returning display name results:", results.length)
      return NextResponse.json({ users: results })
    }

    // If no display name matches, search by email prefix
    console.log("[v0] Server: No display name matches, searching by email prefix...")
    const emailPrefixMatches = authUsers.users.filter((user) => {
      const emailPrefix = (user.email || "").split("@")[0]
      const matches = emailPrefix.toLowerCase() === searchTerm
      if (matches) {
        console.log("[v0] Server: Email prefix match found:", emailPrefix)
      }
      return matches
    })

    console.log("[v0] Server: Email prefix matches:", emailPrefixMatches.length)

    const results = emailPrefixMatches.map((user) => ({
      id: user.id,
      name: user.user_metadata?.display_name || user.user_metadata?.name || user.email?.split("@")[0] || "",
      email: user.email || "",
      emailPrefix: (user.email || "").split("@")[0],
    }))

    console.log("[v0] Server: Returning final results:", results.length)
    return NextResponse.json({ users: results })
  } catch (error) {
    console.error("[v0] Server: Error in search-users API:", error)
    console.error("[v0] Server: Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
