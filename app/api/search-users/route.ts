import { createClient } from "@supabase/supabase-js"
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

    console.log("[v0] Server: Creating Supabase client with service role...")

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
    console.log("[v0] Server: Supabase client created successfully")

    const searchTerm = searchName.trim().toLowerCase()
    console.log("[v0] Server: Searching for term:", searchTerm)

    console.log("[v0] Server: Searching profiles table...")
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, display_name, email")
      .limit(50)

    if (profilesError) {
      console.error("[v0] Server: profiles table error:", profilesError)
      return NextResponse.json({ error: "Failed to search users" }, { status: 500 })
    }

    console.log("[v0] Server: Found profiles records:", profilesData?.length || 0)
    console.log("[v0] Server: Profiles data sample:", JSON.stringify(profilesData?.[0], null, 2))

    const filteredUsers =
      profilesData?.filter((user: any) => {
        const displayName = user.display_name || ""
        const email = user.email || ""
        const searchableText = `${displayName} ${email}`.toLowerCase()
        return searchableText.includes(searchTerm)
      }) || []

    const results = filteredUsers.map((user: any) => ({
      id: user.id,
      display_name: user.display_name || user.email?.split("@")[0] || "",
      email: user.email || "",
      emailPrefix: (user.email || "").split("@")[0],
    }))

    console.log("[v0] Server: Returning results:", results.length)
    return NextResponse.json({ users: results })
  } catch (error) {
    console.error("[v0] Server: Error in search-users API:", error)
    console.error("[v0] Server: Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const searchName = searchParams.get("q")

    console.log("[v0] Server: GET request for search term:", searchName)

    if (!searchName || !searchName.trim()) {
      return NextResponse.json({ users: [] })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const searchTerm = searchName.trim().toLowerCase()

    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, display_name, email")
      .limit(50)

    if (profilesError) {
      console.error("[v0] Server: profiles table error:", profilesError)
      return NextResponse.json({ error: "Failed to search users" }, { status: 500 })
    }

    const filteredUsers =
      profilesData?.filter((user: any) => {
        const displayName = user.display_name || ""
        const email = user.email || ""
        const searchableText = `${displayName} ${email}`.toLowerCase()
        return searchableText.includes(searchTerm)
      }) || []

    const results = filteredUsers.map((user: any) => ({
      id: user.id,
      display_name: user.display_name || user.email?.split("@")[0] || "",
      email: user.email || "",
    }))

    console.log("[v0] Server: Returning results:", results.length)
    return NextResponse.json({ users: results })
  } catch (error) {
    console.error("[v0] Server: Error in GET search-users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
