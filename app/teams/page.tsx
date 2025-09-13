"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Users, Plus, Crown, Clock, CheckCircle, XCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const supabase = createClient()

interface Team {
  id: string
  name: string
  leader_id: string
  status: "pending" | "active" | "disbanded"
  created_at: string
  team_members: TeamMember[]
}

interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: "leader" | "member"
  status: "pending" | "confirmed" | "declined"
  invited_at: string
  confirmed_at?: string
}

interface User {
  id: string
  email: string
}

export default function TeamsPage() {
  const router = useRouter()
  const [teams, setTeams] = useState<Team[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [teamName, setTeamName] = useState("")
  const [memberNames, setMemberNames] = useState<string[]>(["", "", ""])
  const [searchResults, setSearchResults] = useState<any[][]>([[], [], []])

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (currentUser) {
      loadTeams()
      loadUsers()
    }
  }, [currentUser])

  const checkAuth = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/signin")
        return
      }
      setCurrentUser({ id: user.id, email: user.email || "" })
    } catch (error) {
      console.error("Error checking auth:", error)
      router.push("/auth/signin")
    }
  }

  const loadTeams = async () => {
    try {
      const { data, error } = await supabase
        .from("teams")
        .select(`
          *,
          team_members (
            id,
            team_id,
            user_id,
            role,
            status,
            invited_at,
            confirmed_at
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setTeams(data || [])
    } catch (error) {
      console.error("Error loading teams:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase.from("user_info").select("id, email").neq("id", currentUser?.id).limit(20)

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Error loading users:", error)
    }
  }

  const handleMemberNameChange = async (index: number, name: string) => {
    const newNames = [...memberNames]
    newNames[index] = name
    setMemberNames(newNames)

    if (name.trim().length > 0) {
      try {
        console.log(`[v0] Starting search for: ${name}`)
        const response = await fetch(`/api/search-users?q=${encodeURIComponent(name.trim())}`)

        if (!response.ok) {
          console.log(`[v0] Search API error: ${response.status}`)
          return
        }

        const data = await response.json()
        console.log(`[v0] Search API results:`, data.users?.length || 0)

        const newResults = [...searchResults]
        newResults[index] = data.users || []
        setSearchResults(newResults)

        if (data.users && data.users.length === 1) {
          console.log(`[v0] Single user found, auto-selecting`)
          selectUser(index, data.users[0])
        } else if (!data.users || data.users.length === 0) {
          console.log(`[v0] No users found, setting error message`)
          // Clear selection if no users found
          const newSelected = [...selectedMembers]
          newSelected[index] = null
          setSelectedMembers(newSelected)
        }
      } catch (error) {
        console.error(`[v0] Search error:`, error)
      }
    } else {
      const newResults = [...searchResults]
      newResults[index] = []
      setSearchResults(newResults)

      const newSelected = [...selectedMembers]
      newSelected[index] = null
      setSelectedMembers(newSelected)
    }
  }

  const selectUser = (index: number, user: any) => {
    console.log(`[v0] Updating member name at index ${index} to: ${user.display_name}`)
    const newNames = [...memberNames]
    newNames[index] = user.display_name
    setMemberNames(newNames)

    const newSelected = [...selectedMembers]
    newSelected[index] = user.id
    setSelectedMembers(newSelected)

    const newResults = [...searchResults]
    newResults[index] = []
    setSearchResults(newResults)
  }

  const handleCreateTeam = async () => {
    if (!currentUser) {
      alert("로그인이 필요합니다.")
      return
    }

    const validMembers = selectedMembers.filter(Boolean)
    console.log("[v0] Valid members count:", validMembers.length)
    console.log("[v0] Selected members array:", selectedMembers)
    console.log("[v0] Valid members:", validMembers)

    if (validMembers.length !== 3) {
      alert(`정확히 3명의 팀원을 선택해주세요. 현재: ${validMembers.length}명`)
      return
    }

    setCreating(true)
    try {
      console.log("[v0] Starting team creation...")
      console.log("[v0] Current user:", currentUser.id)
      console.log("[v0] Team name:", teamName)
      console.log("[v0] Selected members:", validMembers)

      const generatedTeamName = teamName.trim() || `팀 ${Date.now().toString().slice(-6)}`
      console.log("[v0] Generated team name:", generatedTeamName)

      const requestBody = {
        name: generatedTeamName,
        leader_id: currentUser.id,
        member_ids: validMembers,
      }
      console.log("[v0] Request body:", JSON.stringify(requestBody, null, 2))

      const response = await fetch("/api/create-team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response ok:", response.ok)

      const responseText = await response.text()
      console.log("[v0] Response text:", responseText)

      let result
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        console.error("[v0] Failed to parse response:", parseError)
        throw new Error(`Invalid response format: ${responseText}`)
      }

      if (!response.ok) {
        console.error("[v0] API Error Response:", result)
        throw new Error(result.error || `HTTP ${response.status}: ${responseText}`)
      }

      console.log("[v0] Team created successfully:", result)

      // Reset form
      setTeamName("")
      setMemberNames(["", "", ""])
      setSelectedMembers([])
      setSearchResults([[], [], []])
      setShowCreateDialog(false)

      await loadTeams()
      alert(`팀 "${generatedTeamName}"이 생성되었습니다! 멤버들의 확인을 기다리고 있습니다.`)
    } catch (error) {
      console.error("[v0] Error creating team:", error)
      alert(`팀 생성 중 오류가 발생했습니다: ${error.message}`)
    } finally {
      setCreating(false)
    }
  }

  const handleConfirmInvitation = async (teamId: string) => {
    if (!currentUser) return

    try {
      // Update team member status
      const { error: memberError } = await supabase
        .from("team_members")
        .update({
          status: "confirmed",
          confirmed_at: new Date().toISOString(),
        })
        .eq("team_id", teamId)
        .eq("user_id", currentUser.id)

      if (memberError) throw memberError

      // Update invitation status
      const { error: invitationError } = await supabase
        .from("team_invitations")
        .update({
          status: "accepted",
          responded_at: new Date().toISOString(),
        })
        .eq("team_id", teamId)
        .eq("invitee_id", currentUser.id)

      if (invitationError) throw invitationError

      const { data: teamMembers, error: membersError } = await supabase
        .from("team_members")
        .select("status")
        .eq("team_id", teamId)

      if (!membersError && teamMembers) {
        const allConfirmed = teamMembers.every((member) => member.status === "confirmed")

        if (allConfirmed && teamMembers.length === 4) {
          // Activate the team when all 4 members are confirmed
          const { error: activateError } = await supabase.from("teams").update({ status: "active" }).eq("id", teamId)

          if (!activateError) {
            alert("모든 멤버가 확인했습니다! 팀이 활성화되었습니다.")
          }
        }
      }

      await loadTeams()
      alert("팀 가입을 확인했습니다!")
    } catch (error) {
      console.error("Error confirming invitation:", error)
      alert("확인 중 오류가 발생했습니다.")
    }
  }

  const handleDeclineInvitation = async (teamId: string) => {
    if (!currentUser) return

    try {
      // Update team member status
      const { error: memberError } = await supabase
        .from("team_members")
        .update({ status: "declined" })
        .eq("team_id", teamId)
        .eq("user_id", currentUser.id)

      if (memberError) throw memberError

      // Update invitation status
      const { error: invitationError } = await supabase
        .from("team_invitations")
        .update({
          status: "declined",
          responded_at: new Date().toISOString(),
        })
        .eq("team_id", teamId)
        .eq("invitee_id", currentUser.id)

      if (invitationError) throw invitationError

      await loadTeams()
      alert("팀 초대를 거절했습니다.")
    } catch (error) {
      console.error("Error declining invitation:", error)
      alert("거절 중 오류가 발생했습니다.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-8">팀 정보를 불러오는 중...</div>
        </div>
      </div>
    )
  }

  const myTeams = teams.filter((team) => team.team_members.some((member) => member.user_id === currentUser?.id))

  const pendingInvitations = teams.filter((team) =>
    team.team_members.some((member) => member.user_id === currentUser?.id && member.status === "pending"),
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">팀 메뉴</h1>
            <p className="text-muted-foreground mt-2">4명으로 구성된 팀을 만들고 관리하세요</p>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button
                className="bg-orange-600 hover:bg-orange-700"
                onClick={() => {
                  console.log("[v0] Team creation dialog trigger clicked")
                  setShowCreateDialog(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />팀 만들기
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-auto fixed top-[20px] left-1/2 transform -translate-x-1/2 h-[95vh] flex flex-col z-50 bg-white dark:bg-gray-900 border-4 border-blue-500 shadow-2xl">
              <DialogHeader className="pb-4 bg-blue-100 dark:bg-blue-900 -mx-6 -mt-6 px-6 pt-6 mb-4">
                <DialogTitle className="text-xl text-blue-800 dark:text-blue-200">
                  새 팀 만들기 (최상단 위치)
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 flex-1 overflow-y-auto px-1" style={{ maxHeight: "calc(95vh - 120px)" }}>
                <div>
                  <label className="block text-sm font-medium mb-2">팀 이름</label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="팀 이름을 입력하세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-sm text-muted-foreground mt-1">팀 이름은 자동으로 생성됩니다</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">팀원 이름 (3명)</label>
                  <div className="space-y-3">
                    {[0, 1, 2].map((index) => (
                      <div key={index}>
                        <input
                          type="text"
                          value={memberNames[index] || ""}
                          onChange={(e) => handleMemberNameChange(index, e.target.value)}
                          placeholder={`${index + 1}번째 팀원 이름`}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        {searchResults[index] && searchResults[index].length > 0 && (
                          <div className="mt-1 border border-gray-200 rounded-md bg-white dark:bg-gray-800 max-h-32 overflow-y-auto">
                            {searchResults[index].map((user: any) => (
                              <div
                                key={user.id}
                                onClick={() => selectUser(index, user)}
                                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b last:border-b-0"
                              >
                                <div className="font-medium text-sm">{user.display_name}</div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {memberNames[index] && !selectedMembers[index] && (
                          <div className="text-red-500 text-xs mt-1">해당 이름의 사용자를 찾을 수 없습니다</div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">팀장 포함 총 4명으로 구성됩니다</p>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    취소
                  </Button>
                  <Button
                    onClick={handleCreateTeam}
                    disabled={creating || selectedMembers.filter(Boolean).length !== 3}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {creating ? "생성 중..." : "팀 만들기"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">대기 중인 초대</h2>
            <div className="grid gap-4">
              {pendingInvitations.map((team) => (
                <Card key={team.id} className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">팀 {team.name}</CardTitle>
                      <Badge variant="outline" className="bg-orange-100">
                        <Clock className="h-3 w-3 mr-1" />
                        초대 대기중
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleConfirmInvitation(team.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        확인
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeclineInvitation(team.id)}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        거절
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* My Teams */}
        <div>
          <h2 className="text-xl font-semibold mb-4">내 팀 목록</h2>
          {myTeams.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">아직 팀이 없습니다</h3>
                <p className="text-gray-600 mb-6">첫 번째 팀을 만들어보세요!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {myTeams.map((team) => {
                const confirmedMembers = team.team_members.filter((m) => m.status === "confirmed")
                const pendingMembers = team.team_members.filter((m) => m.status === "pending")
                const isLeader = team.leader_id === currentUser?.id

                return (
                  <Card key={team.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">팀 {team.name}</CardTitle>
                        <div className="flex gap-2">
                          {isLeader && (
                            <Badge className="bg-purple-600">
                              <Crown className="h-3 w-3 mr-1" />
                              팀장
                            </Badge>
                          )}
                          <Badge
                            variant={team.status === "active" ? "default" : "secondary"}
                            className={team.status === "active" ? "bg-green-600" : ""}
                          >
                            {team.status === "active" ? "활성" : "대기중"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="h-4 w-4" />
                            <span>확인: {confirmedMembers.length}/4명</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">팀 멤버:</p>
                          <div className="space-y-1">
                            {team.team_members.map((member) => (
                              <div key={member.id} className="flex items-center justify-between text-sm">
                                <span>
                                  {member.user_id === currentUser?.id
                                    ? "나"
                                    : `사용자 ${member.user_id.slice(0, 8)}...`}
                                </span>
                                <div className="flex gap-2">
                                  {member.role === "leader" && (
                                    <Badge variant="outline" className="text-xs">
                                      팀장
                                    </Badge>
                                  )}
                                  <Badge
                                    variant={member.status === "confirmed" ? "default" : "secondary"}
                                    className={`text-xs ${
                                      member.status === "confirmed"
                                        ? "bg-green-600"
                                        : member.status === "pending"
                                          ? "bg-yellow-600"
                                          : "bg-red-600"
                                    }`}
                                  >
                                    {member.status === "confirmed"
                                      ? "확인됨"
                                      : member.status === "pending"
                                        ? "대기중"
                                        : "거절됨"}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
