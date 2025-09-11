import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  const cookieStore = cookies()
  const userSession = cookieStore.get("user_session")

  if (!userSession) {
    return NextResponse.json({ user: null })
  }

  try {
    const user = JSON.parse(userSession.value)
    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ user: null })
  }
}
