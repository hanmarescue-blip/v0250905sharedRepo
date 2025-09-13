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

    console.log("[v0] Server: Querying user_info table...")
    const { data: userInfo, error: searchError } = await supabase
      .from("user_info")
      .select("id, display_name, email")
      .or(`display_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .limit(10)

    if (searchError) {
      console.error("[v0] Server: Error searching user_info:", searchError)
      console.error("[v0] Server: Error details:", JSON.stringify(searchError, null, 2))
      return NextResponse.json({ error: "Failed to search users" }, { status: 500 })
    }

    console.log("[v0] Server: Found user_info records:", userInfo?.length || 0)
    console.log("[v0] Server: User_info data:", JSON.stringify(userInfo, null, 2))

    if (!userInfo || userInfo.length === 0) {
      console.log("[v0] Server: No user_info records found")
      return NextResponse.json({ users: [] })
    }

    const results = userInfo.map((user) => ({
      id: user.id,
      display_name: user.display_name || user.email?.split("@")[0] || "",
      email: user.email || "",
      emailPrefix: (user.email || "").split("@")[0],
    }))

    console.log("[v0] Server: Returning results:", results.length)
    console.log("[v0] Server: Results data:", JSON.stringify(results, null, 2))
    return NextResponse.json({ users: results })
  } catch (error) {
    console.error("[v0] Server: Error in search-users API:", error)
    console.error("[v0] Server: Error stack:", error instanceof Error ? error.stack : "No stack trace")
    console.error("[v0] Server: Error message:", error instanceof Error ? error.message : String(error))
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

    const { data: userInfo, error: searchError } = await supabase
      .from("user_info")
      .select("id, display_name, email")
      .or(`display_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .limit(10)

    if (searchError) {
      console.error("[v0] Server: Error searching user_info:", searchError)
      return NextResponse.json({ error: "Failed to search users" }, { status: 500 })
    }

    const results =
      userInfo?.map((user) => ({
        id: user.id,
        display_name: user.display_name || user.email?.split("@")[0] || "",
        email: user.email || "",
      })) || []

    return NextResponse.json({ users: results })
  } catch (error) {
    console.error("[v0] Server: Error in GET search-users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
