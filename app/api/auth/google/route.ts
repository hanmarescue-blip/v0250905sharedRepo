import { getGoogleAuthUrl } from "@/lib/google-auth"
import { NextResponse } from "next/server"

export async function GET() {
  const authUrl = getGoogleAuthUrl()
  return NextResponse.redirect(authUrl)
}
