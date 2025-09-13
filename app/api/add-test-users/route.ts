import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  console.log("[v0] Adding test users to user_info...")

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

    const testUsers = [
      { email: "hanmabong@gmail.com", display_name: "caber han", password: "testpassword123" },
      { email: "cruisehship@gmail.com", display_name: "cruise H", password: "testpassword123" },
      { email: "terralinda82@gmail.com", display_name: "EUNJUNG KIM", password: "testpassword123" },
      { email: "global.ieum@gmail.com", display_name: "EUNJUNG KIM", password: "testpassword123" },
      { email: "weglobal82@gmail.com", display_name: "EUNJUNG KIM", password: "testpassword123" },
      { email: "hanmarescue@gmail.com", display_name: "flight rescue", password: "testpassword123" },
    ]

    const createdUsers = []

    for (const user of testUsers) {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      })

      if (authError) {
        console.log(`[v0] Auth user creation error for ${user.email}:`, authError)
        continue
      }

      if (authData.user) {
        const { data: userInfoData, error: userInfoError } = await supabase
          .from("user_info")
          .insert({
            user_id: authData.user.id,
            email: user.email,
            display_name: user.display_name,
          })
          .select()

        if (userInfoError) {
          console.log(`[v0] User_info creation error for ${user.email}:`, userInfoError)
        } else {
          createdUsers.push(userInfoData[0])
          console.log(`[v0] Created user and user_info for ${user.email}`)
        }
      }
    }

    console.log("[v0] Test users created:", createdUsers.length)

    return NextResponse.json({
      message: "Test users added successfully",
      count: createdUsers.length,
      users: createdUsers,
    })
  } catch (error) {
    console.log("[v0] Add test users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
