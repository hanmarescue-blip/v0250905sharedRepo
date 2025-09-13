"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, X, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

interface TeamInvitation {
  id: string
  team_id: string
  inviter_id: string
  invitee_id: string
  created_at: string
  status: string
  teams: {
    name: string
    leader_id: string
  }
}

interface TeamInvitationsProps {
  currentUserId: string
}

export default function TeamInvitations({ currentUserId }: TeamInvitationsProps) {
  const [invitations, setInvitations] = useState<TeamInvitation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInvitations()
  }, [currentUserId])

  const loadInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from("team_invitations")
        .select(`
          *,
          teams (
            name,
            leader_id
          )
        `)
        .like("invitee_id", `%${currentUserId}%`)
        .eq("status", "pending")
        .order("created_at", { ascending: false })

      if (error) throw error
      setInvitations(data || [])
    } catch (error) {
      console.error("Error loading invitations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptInvitation = async (invitationId: string, teamId: string) => {
    try {
      const { error: invitationError } = await supabase
        .from("team_invitations")
        .update({
          status: "accepted",
          responded_at: new Date().toISOString(),
        })
        .eq("id", invitationId)

      if (invitationError) throw invitationError

      const { error: memberError } = await supabase.from("team_members").insert({
        team_id: teamId,
        user_id: currentUserId,
        role: "member",
        status: "confirmed",
      })

      if (memberError) throw memberError

      await loadInvitations()
      alert("팀 초대를 수락했습니다!")
    } catch (error) {
      console.error("Error accepting invitation:", error)
      alert("초대 수락 중 오류가 발생했습니다.")
    }
  }

  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from("team_invitations")
        .update({
          status: "declined",
          responded_at: new Date().toISOString(),
        })
        .eq("id", invitationId)

      if (error) throw error

      await loadInvitations()
      alert("팀 초대를 거절했습니다.")
    } catch (error) {
      console.error("Error declining invitation:", error)
      alert("초대 거절 중 오류가 발생했습니다.")
    }
  }

  if (loading) {
    return <div className="text-center py-4">초대 알림을 불러오는 중...</div>
  }

  if (invitations.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-orange-600" />
        <h3 className="text-lg font-semibold">팀 초대 알림</h3>
        <Badge variant="secondary">{invitations.length}</Badge>
      </div>

      <div className="space-y-3">
        {invitations.map((invitation) => (
          <Card key={invitation.id} className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />팀 "{invitation.teams.name}" 초대
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">팀에 참여하도록 초대되었습니다. 수락하시겠습니까?</p>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleAcceptInvitation(invitation.id, invitation.team_id)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    수락
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeclineInvitation(invitation.id)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-1" />
                    거절
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
