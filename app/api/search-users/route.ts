import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Server: Starting search-users API")

    const { searchName } = await request.json()
    console.log("[v0] Server: Received search request for:", searchName)

    if (!searchName || !searchName.trim()) {
      console.log("[v0] Server: Empty search name, returning empty results")
      return NextResponse.json({ users: [] })
    }

    console.log("[v0] Server: Creating Supabase client...")

    const supabase = await createClient()
    console.log("[v0] Server: Supabase client created successfully")

    const searchTerm = searchName.trim().toLowerCase()
    console.log("[v0] Server: Searching for term:", searchTerm)

    console.log("[v0] Server: Querying profiles table...")
    const { data: profiles, error: searchError } = await supabase
      .from("profiles")
      .select("id, display_name, email")
      .or(`display_name.ilike.%${searchTerm}%,email.ilike.${searchTerm}%`)
      .limit(10)

    if (searchError) {
      console.error("[v0] Server: Error searching profiles:", searchError)
      return NextResponse.json({ error: "Failed to search users" }, { status: 500 })
    }

    console.log("[v0] Server: Found profiles:", profiles?.length || 0)

    if (!profiles || profiles.length === 0) {
      console.log("[v0] Server: No profiles found")
      return NextResponse.json({ users: [] })
    }

    const results = profiles.map((profile) => ({
      id: profile.id,
      name: profile.display_name || profile.email?.split("@")[0] || "",
      email: profile.email || "",
      emailPrefix: (profile.email || "").split("@")[0],
    }))

    console.log("[v0] Server: Returning results:", results.length)
    return NextResponse.json({ users: results })
  } catch (error) {
    console.error("[v0] Server: Error in search-users API:", error)
    console.error("[v0] Server: Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
