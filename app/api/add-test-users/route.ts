import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  console.log("[v0] Adding test users to profiles...")

  try {
    const supabase = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set() {},
        remove() {},
      },
    })

    const testUsers = [
      { email: "caber.han@example.com", display_name: "caber han" },
      { email: "cruise.h@example.com", display_name: "cruise H" },
      { email: "eunjung.kim@example.com", display_name: "eunjung kim" },
      { email: "hanmabong@example.com", display_name: "hanmabong" },
      { email: "john.doe@example.com", display_name: "John Doe" },
      { email: "jane.smith@example.com", display_name: "Jane Smith" },
    ]

    const { data, error } = await supabase.from("profiles").upsert(testUsers, { onConflict: "email" }).select()

    if (error) {
      console.log("[v0] Insert error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Test users added:", data?.length || 0)
    console.log("[v0] Added users:", data)

    return NextResponse.json({
      message: "Test users added successfully",
      count: data?.length || 0,
      users: data || [],
    })
  } catch (error) {
    console.log("[v0] Add test users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
