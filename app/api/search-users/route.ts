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

    console.log("[v0] Server: Checking available tables...")

    // Try user_info first
    console.log("[v0] Server: Trying user_info table...")
    const { data: userInfoData, error: userInfoError } = await supabase.from("user_info").select("*").limit(1)

    if (userInfoError) {
      console.log("[v0] Server: user_info table error:", userInfoError)

      // Try profiles table instead
      console.log("[v0] Server: Trying profiles table...")
      const { data: profilesData, error: profilesError } = await supabase.from("profiles").select("*").limit(10)

      if (profilesError) {
        console.error("[v0] Server: profiles table also failed:", profilesError)
        return NextResponse.json({ error: "No valid user table found" }, { status: 500 })
      }

      console.log("[v0] Server: Using profiles table, found records:", profilesData?.length || 0)
      console.log("[v0] Server: Profiles data sample:", JSON.stringify(profilesData?.[0], null, 2))

      const filteredUsers =
        profilesData?.filter((user: any) => {
          const displayName = user.display_name || user.name || user.username || ""
          const email = user.email || ""
          const searchableText = `${displayName} ${email}`.toLowerCase()
          return searchableText.includes(searchTerm)
        }) || []

      const results = filteredUsers.map((user: any) => ({
        id: user.id,
        display_name: user.display_name || user.name || user.username || user.email?.split("@")[0] || "",
        email: user.email || "",
        emailPrefix: (user.email || "").split("@")[0],
      }))

      console.log("[v0] Server: Returning results from profiles:", results.length)
      return NextResponse.json({ users: results })
    }

    console.log("[v0] Server: user_info table works, found records:", userInfoData?.length || 0)
    console.log("[v0] Server: User_info data sample:", JSON.stringify(userInfoData?.[0], null, 2))

    // Get more records for actual search
    const { data: allUserInfo, error: searchError } = await supabase.from("user_info").select("*").limit(10)

    if (searchError) {
      console.error("[v0] Server: Error searching user_info:", searchError)
      return NextResponse.json({ error: "Failed to search users" }, { status: 500 })
    }

    const filteredUsers =
      allUserInfo?.filter((user: any) => {
        const displayName = user.display_name || user.name || user.username || ""
        const email = user.email || ""
        const searchableText = `${displayName} ${email}`.toLowerCase()
        return searchableText.includes(searchTerm)
      }) || []

    const results = filteredUsers.map((user: any) => ({
      id: user.id,
      display_name: user.display_name || user.name || user.username || user.email?.split("@")[0] || "",
      email: user.email || "",
      emailPrefix: (user.email || "").split("@")[0],
    }))

    console.log("[v0] Server: Returning results from user_info:", results.length)
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

    console.log("[v0] Server: Checking available tables...")

    // Try user_info first
    console.log("[v0] Server: Trying user_info table...")
    const { data: userInfoData, error: userInfoError } = await supabase.from("user_info").select("*").limit(1)

    if (userInfoError) {
      console.log("[v0] Server: user_info table error:", userInfoError)

      // Try profiles table instead
      console.log("[v0] Server: Trying profiles table...")
      const { data: profilesData, error: profilesError } = await supabase.from("profiles").select("*").limit(10)

      if (profilesError) {
        console.error("[v0] Server: profiles table also failed:", profilesError)
        return NextResponse.json({ error: "No valid user table found" }, { status: 500 })
      }

      console.log("[v0] Server: Using profiles table, found records:", profilesData?.length || 0)
      console.log("[v0] Server: Profiles data sample:", JSON.stringify(profilesData?.[0], null, 2))

      const filteredUsers =
        profilesData?.filter((user: any) => {
          const displayName = user.display_name || user.name || user.username || ""
          const email = user.email || ""
          const searchableText = `${displayName} ${email}`.toLowerCase()
          return searchableText.includes(searchTerm)
        }) || []

      const results = filteredUsers.map((user: any) => ({
        id: user.id,
        display_name: user.display_name || user.name || user.username || user.email?.split("@")[0] || "",
        email: user.email || "",
      }))

      console.log("[v0] Server: Returning results from profiles:", results.length)
      return NextResponse.json({ users: results })
    }

    console.log("[v0] Server: user_info table works, found records:", userInfoData?.length || 0)
    console.log("[v0] Server: User_info data sample:", JSON.stringify(userInfoData?.[0], null, 2))

    // Get more records for actual search
    const { data: allUserInfo, error: searchError } = await supabase.from("user_info").select("*").limit(10)

    if (searchError) {
      console.error("[v0] Server: Error searching user_info:", searchError)
      return NextResponse.json({ error: "Failed to search users" }, { status: 500 })
    }

    const filteredUsers =
      allUserInfo?.filter((user: any) => {
        const displayName = user.display_name || user.name || user.username || ""
        const email = user.email || ""
        const searchableText = `${displayName} ${email}`.toLowerCase()
        return searchableText.includes(searchTerm)
      }) || []

    const results = filteredUsers.map((user: any) => ({
      id: user.id,
      display_name: user.display_name || user.name || user.username || user.email?.split("@")[0] || "",
      email: user.email || "",
    }))

    return NextResponse.json({ users: results })
  } catch (error) {
    console.error("[v0] Server: Error in GET search-users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
