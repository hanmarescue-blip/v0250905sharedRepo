"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"

interface NotificationBadgeProps {
  userId: string
}

export function NotificationBadge({ userId }: NotificationBadgeProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const response = await fetch(`/api/notifications?user_id=${userId}`)
        const data = await response.json()

        if (data.success) {
          setCount(data.notifications.length)
        }
      } catch (error) {
        console.error("Failed to fetch notification count:", error)
      }
    }

    fetchNotificationCount()

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000)

    return () => clearInterval(interval)
  }, [userId])

  if (count === 0) {
    return (
      <div className="relative">
        <Bell className="h-5 w-5" />
      </div>
    )
  }

  return (
    <div className="relative">
      <Bell className="h-5 w-5" />
      <Badge
        variant="destructive"
        className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
      >
        {count > 9 ? "9+" : count}
      </Badge>
    </div>
  )
}
