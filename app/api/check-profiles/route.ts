import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  console.log("[v0] Checking profiles table...")

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

    const { data: profiles, error } = await supabase.from("profiles").select("*").limit(10)

    if (error) {
      console.log("[v0] Profiles query error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Profiles found:", profiles?.length || 0)
    console.log("[v0] Profiles data:", profiles)

    return NextResponse.json({
      count: profiles?.length || 0,
      profiles: profiles || [],
    })
  } catch (error) {
    console.log("[v0] Check profiles error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
