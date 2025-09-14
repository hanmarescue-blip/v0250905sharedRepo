import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  console.log("[v0] Checking user_info table...")

  try {
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set() {},
        remove() {},
      },
    })

    const { data: userInfo, error } = await supabase.from("user_info").select("*").limit(10)

    if (error) {
      console.log("[v0] User_info query error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] User_info found:", userInfo?.length || 0)
    console.log("[v0] User_info data:", userInfo)

    return NextResponse.json({
      count: userInfo?.length || 0,
      user_info: userInfo || [],
    })
  } catch (error) {
    console.log("[v0] Check user_info error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
