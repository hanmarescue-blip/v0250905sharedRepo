import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import FeedClient from "./feed-client"

export default async function FeedPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  return <FeedClient />
}
