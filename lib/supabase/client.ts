import { createBrowserClient } from "@supabase/ssr"

console.log("[v0] Checking user session...")
console.log(
  "[v0] Supabase configured:",
  !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0
  ),
)
console.log("[v0] SUPABASE_URL exists:", !!process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log("[v0] SUPABASE_ANON_KEY exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
console.log("[v0] SUPABASE_URL value:", process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log(
  "[v0] SUPABASE_ANON_KEY value:",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "***" + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.slice(-4) : "undefined",
)

export const isSupabaseConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0
)

if (!isSupabaseConfigured) {
  console.log("[v0] Supabase not configured, skipping auth check")
}

export function createClient() {
  if (!isSupabaseConfigured) {
    console.warn("Supabase environment variables are not configured")
    // Return a dummy client for build compatibility
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signInWithOAuth: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
      }),
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: null }),
          getPublicUrl: () => ({ data: { publicUrl: "" } }),
        }),
      },
    } as any
  }

  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

// Create client lazily when needed
let clientInstance: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!clientInstance) {
    clientInstance = createClient()
  }
  return clientInstance
}

// Export for backward compatibility
export const supabase = getSupabaseClient()
