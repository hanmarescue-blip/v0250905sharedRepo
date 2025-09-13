import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  console.log("[v0] Auth callback received code:", !!code)

  // For now, just redirect to home page
  // In a real implementation, this would exchange the code for a session
  return NextResponse.redirect(requestUrl.origin)
}
