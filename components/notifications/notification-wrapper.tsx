"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import TeamNotifications from "./team-notifications"

const supabase = createClient()

export default function NotificationWrapper() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
    }

    checkUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserId(session.user.id)
      } else {
        setUserId(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!userId) {
    return null
  }

  return <TeamNotifications userId={userId} />
}
