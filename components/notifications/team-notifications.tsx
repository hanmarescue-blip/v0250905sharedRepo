"use client"

import { useState, useEffect } from "react"
import { Bell, CheckCircle, XCircle, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

interface TeamInvitation {
  id: string
  team_id: string
  inviter_id: string
  invitee_id: string
  status: "pending" | "accepted" | "declined"
  created_at: string
  team: {
    id: string
    name: string
    leader_id: string
  }
  inviter: {
    id: string
    email: string
  }
}

interface TeamNotificationsProps {
  userId: string
}

export default function TeamNotifications({ userId }: TeamNotificationsProps) {
  const [invitations, setInvitations] = useState<TeamInvitation[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (userId) {
      loadInvitations()
    }
  }, [userId])

  const loadInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from("team_invitations")
        .select(`
          *,
          team:teams (
            id,
            name,
            leader_id
          ),
          inviter:profiles!team_invitations_inviter_id_fkey (
            id,
            email
          )
        `)
        .eq("invitee_id", userId)
        .eq("status", "pending")
        .order("created_at", { ascending: false })

      if (error) throw error
      setInvitations(data || [])

      // Auto-show notifications if there are pending invitations
      if (data && data.length > 0) {
        setShowNotifications(true)
      }
    } catch (error) {
      console.error("Error loading invitations:", error)
    }
  }

  const handleInvitationResponse = async (invitationId: string, teamId: string, response: "accepted" | "declined") => {
    setLoading(true)
    try {
      // Update invitation status
      const { error: invitationError } = await supabase
        .from("team_invitations")
        .update({
          status: response,
          responded_at: new Date().toISOString(),
        })
        .eq("id", invitationId)

      if (invitationError) throw invitationError

      // Update team member status
      const { error: memberError } = await supabase
        .from("team_members")
        .update({
          status: response === "accepted" ? "confirmed" : "declined",
          confirmed_at: response === "accepted" ? new Date().toISOString() : null,
        })
        .eq("team_id", teamId)
        .eq("user_id", userId)

      if (memberError) throw memberError

      // Check if all members have confirmed to activate team
      if (response === "accepted") {
        const { data: teamMembers, error: membersError } = await supabase
          .from("team_members")
          .select("status")
          .eq("team_id", teamId)

        if (!membersError && teamMembers) {
          const allConfirmed = teamMembers.every((member) => member.status === "confirmed")

          if (allConfirmed) {
            // Activate the team
            await supabase.from("teams").update({ status: "active" }).eq("id", teamId)
          }
        }
      }

      // Reload invitations
      await loadInvitations()

      const message = response === "accepted" ? "팀 초대를 수락했습니다!" : "팀 초대를 거절했습니다."
      alert(message)
    } catch (error) {
      console.error("Error responding to invitation:", error)
      alert("응답 처리 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  if (invitations.length === 0) {
    return null
  }

  return (
    <>
      {/* Notification Bell */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => setShowNotifications(true)}
          className="relative bg-orange-600 hover:bg-orange-700 rounded-full p-3"
        >
          <Bell className="h-5 w-5" />
          {invitations.length > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-600 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
              {invitations.length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Notifications Modal */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="max-w-md mx-auto my-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />팀 초대 알림
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {invitations.map((invitation) => (
              <Card key={invitation.id} className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4" />팀 {invitation.team.name} 초대
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{invitation.inviter.email}님이 팀에 초대했습니다</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleInvitationResponse(invitation.id, invitation.team_id, "accepted")}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      수락
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleInvitationResponse(invitation.id, invitation.team_id, "declined")}
                      disabled={loading}
                      className="text-red-600 border-red-300 hover:bg-red-50 flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      거절
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
