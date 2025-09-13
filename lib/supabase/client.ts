const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("[v0] Supabase URL:", supabaseUrl)
console.log("[v0] Supabase Anon Key:", supabaseAnonKey ? "***" + supabaseAnonKey.slice(-4) : "undefined")

export const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.length > 0 &&
  supabaseAnonKey.length > 0
)

console.log("[v0] Supabase configured:", isSupabaseConfigured)

export function createClient() {
  if (!isSupabaseConfigured) {
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: new Error("Supabase not configured") }),
        getSession: () => Promise.resolve({ data: { session: null }, error: new Error("Supabase not configured") }),
        signInWithOAuth: () => {
          console.error("[v0] Cannot sign in: Supabase not configured. Please set environment variables.")
          return Promise.resolve({ data: null, error: new Error("Supabase not configured") })
        },
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => Promise.resolve({ data: [], error: new Error("Supabase not configured") }),
        insert: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
        update: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
        delete: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      }),
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
          getPublicUrl: () => ({ data: { publicUrl: "" } }),
        }),
      },
    } as any
  }

  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithOAuth: () => Promise.resolve({ data: null, error: null }),
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
