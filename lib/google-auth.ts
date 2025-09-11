export function getGoogleAuthUrl() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NODE_ENV === "production"
      ? "https://your-production-domain.com"
      : "http://localhost:3000"
  const redirectUri = `${baseUrl}/api/auth/google/callback`

  console.log("[v0] === Google OAuth Debug Info ===")
  console.log("[v0] Client ID:", clientId ? `${clientId.substring(0, 20)}...` : "MISSING")
  console.log("[v0] Base URL:", baseUrl)
  console.log("[v0] VERCEL_URL:", process.env.VERCEL_URL)
  console.log("[v0] NODE_ENV:", process.env.NODE_ENV)
  console.log("[v0] Redirect URI:", redirectUri)
  console.log("[v0] Redirect URI Length:", redirectUri.length)
  console.log("[v0] === Add this EXACT URI to Google Console ===")
  console.log(redirectUri)
  console.log("[v0] =======================================")

  const params = new URLSearchParams({
    client_id: clientId!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  })

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  console.log("[v0] Full OAuth URL:", authUrl)

  return authUrl
}

export async function exchangeCodeForTokens(code: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NODE_ENV === "production"
      ? "https://your-production-domain.com"
      : "http://localhost:3000"
  const redirectUri = `${baseUrl}/api/auth/google/callback`

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  })

  return response.json()
}

export async function getUserInfo(accessToken: string) {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  return response.json()
}
