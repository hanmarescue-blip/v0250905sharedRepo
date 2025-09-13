"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, Users } from "lucide-react"

interface Notification {
  id: string
  team_id: string
  inviter_id: string
  status: string
  created_at: string
  teams: {
    id: string
    name: string
    leader_id: string
  }
  inviter: {
    id: string
    display_name: string
    email: string
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState<string | null>(null)

  // Mock user ID - in real app, get from auth context
  const currentUserId = "current-user-id"

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?user_id=${currentUserId}`)
      const data = await response.json()

      if (data.success) {
        setNotifications(data.notifications)
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const respondToInvitation = async (invitationId: string, response: "accepted" | "rejected") => {
    setResponding(invitationId)

    try {
      const res = await fetch("/api/respond-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invitation_id: invitationId,
          user_id: currentUserId,
          response,
        }),
      })

      const data = await res.json()

      if (data.success) {
        // Remove the notification from the list
        setNotifications((prev) => prev.filter((n) => n.id !== invitationId))
      } else {
        alert("Failed to respond to invitation")
      }
    } catch (error) {
      console.error("Failed to respond:", error)
      alert("Failed to respond to invitation")
    } finally {
      setResponding(null)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">알림을 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">알림</h1>
        <p className="text-muted-foreground">팀 초대 및 알림을 확인하세요</p>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">새로운 알림이 없습니다</h3>
            <p className="text-muted-foreground text-center">팀 초대나 다른 알림이 있으면 여기에 표시됩니다</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">팀 초대</CardTitle>
                    <CardDescription>
                      {notification.inviter.display_name}님이 "{notification.teams.name}" 팀에 초대했습니다
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    대기 중
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <p>초대자: {notification.inviter.display_name}</p>
                    <p>팀명: {notification.teams.name}</p>
                    <p>초대일: {new Date(notification.created_at).toLocaleDateString("ko-KR")}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => respondToInvitation(notification.id, "rejected")}
                      disabled={responding === notification.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      거절
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => respondToInvitation(notification.id, "accepted")}
                      disabled={responding === notification.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      수락
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
