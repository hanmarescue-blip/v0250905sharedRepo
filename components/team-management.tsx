"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Users, Plus, Crown, UserMinus, Search, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

interface Team {
  id: string
  name: string
  club_id: string
  leader_id: string
  created_at: string
  team_members: TeamMember[]
}

interface TeamMember {
  id: string
  team_id: string
  user_id: string
  joined_at: string
  role: string
  status: string
}

interface User {
  id: string
  name: string
  email: string
}

interface UserSearchResult {
  user: User
  emailPrefix: string
}

interface TeamManagementProps {
  clubId: string
  currentUserId: string
}

export default function TeamManagement({ clubId, currentUserId }: TeamManagementProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const [memberNames, setMemberNames] = useState<string[]>(["", "", ""])
  const [memberSearchResults, setMemberSearchResults] = useState<(UserSearchResult[] | null)[]>([null, null, null])
  const [selectedMembers, setSelectedMembers] = useState<(User | null)[]>([null, null, null])
  const [searchErrors, setSearchErrors] = useState<(string | null)[]>([null, null, null])
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTeams()
  }, [clubId])

  const generateNextTeamName = () => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const existingNames = teams.map((team) => team.name).filter((name) => /^[A-Z]$/.test(name))

    for (let i = 0; i < alphabet.length; i++) {
      const letter = alphabet[i]
      if (!existingNames.includes(letter)) {
        return letter
      }
    }

    for (let i = 0; i < alphabet.length; i++) {
      for (let j = 0; j < alphabet.length; j++) {
        const name = alphabet[i] + alphabet[j]
        if (!existingNames.includes(name)) {
          return name
        }
      }
    }

    return `팀${teams.length + 1}`
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
            joined_at,
            role,
            status
          )
        `)
        .eq("club_id", clubId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setTeams(data || [])
    } catch (error) {
      console.error("Error loading teams:", error)
    } finally {
      setLoading(false)
    }
  }

  const searchUsers = async (name: string): Promise<UserSearchResult[]> => {
    if (!name.trim()) return []

    console.log("[v0] Searching for user:", name.trim())

    try {
      console.log("[v0] Searching for exact name match...")
      const { data: exactMatches, error: exactError } = await supabase
        .from("users")
        .select("id, name, email")
        .ilike("name", name.trim())

      if (exactError) {
        console.log("[v0] Exact search error:", exactError)
        throw exactError
      }

      console.log("[v0] Exact matches found:", exactMatches?.length || 0)

      if (exactMatches && exactMatches.length > 0) {
        console.log("[v0] Returning exact matches:", exactMatches)
        return exactMatches.map((user) => ({
          user,
          emailPrefix: user.email.split("@")[0],
        }))
      }

      console.log("[v0] No exact matches, searching by email prefix...")
      const { data: emailMatches, error: emailError } = await supabase
        .from("users")
        .select("id, name, email")
        .ilike("email", `${name.trim()}@%`)

      if (emailError) {
        console.log("[v0] Email search error:", emailError)
        throw emailError
      }

      console.log("[v0] Email matches found:", emailMatches?.length || 0)

      if (emailMatches && emailMatches.length > 0) {
        console.log("[v0] Returning email matches:", emailMatches)
        return emailMatches.map((user) => ({
          user,
          emailPrefix: user.email.split("@")[0],
        }))
      }

      console.log("[v0] No matches found for:", name.trim())
      return []
    } catch (error) {
      console.error("[v0] Error searching users:", error)
      return []
    }
  }

  const updateMemberName = async (index: number, name: string) => {
    console.log("[v0] Updating member name at index", index, "to:", name)

    const newNames = [...memberNames]
    newNames[index] = name
    setMemberNames(newNames)

    const newSearchResults = [...memberSearchResults]
    const newSelectedMembers = [...selectedMembers]
    const newSearchErrors = [...searchErrors]

    newSearchResults[index] = null
    newSelectedMembers[index] = null
    newSearchErrors[index] = null

    if (name.trim()) {
      console.log("[v0] Starting search for:", name.trim())
      const results = await searchUsers(name)
      console.log("[v0] Search results:", results)

      if (results.length === 0) {
        console.log("[v0] No users found, setting error message")
        newSearchErrors[index] = "해당 이름의 사용자를 찾을 수 없습니다."
      } else if (results.length === 1) {
        console.log("[v0] Single user found, auto-selecting")
        newSelectedMembers[index] = results[0].user
        newSearchErrors[index] = null
      } else {
        console.log("[v0] Multiple users found, showing selection")
        newSearchResults[index] = results
        newSearchErrors[index] = null
      }
    }

    setMemberSearchResults(newSearchResults)
    setSelectedMembers(newSelectedMembers)
    setSearchErrors(newSearchErrors)
  }

  const selectMember = (index: number, user: User) => {
    const newSelectedMembers = [...selectedMembers]
    const newSearchResults = [...memberSearchResults]

    newSelectedMembers[index] = user
    newSearchResults[index] = null

    setSelectedMembers(newSelectedMembers)
    setMemberSearchResults(newSearchResults)
  }

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return

    const validMembers = selectedMembers.filter((member) => member !== null)
    if (validMembers.length !== memberNames.filter((name) => name.trim()).length) {
      alert("모든 팀원을 올바르게 선택해주세요.")
      return
    }

    setCreating(true)
    try {
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .insert({
          name: newTeamName,
          club_id: clubId,
          leader_id: currentUserId,
          status: "active",
        })
        .select()
        .single()

      if (teamError) throw teamError

      const { error: memberError } = await supabase.from("team_members").insert({
        team_id: teamData.id,
        user_id: currentUserId,
        role: "leader",
        status: "confirmed",
      })

      if (memberError) throw memberError

      const memberInvitations = validMembers.map((member) => ({
        team_id: teamData.id,
        inviter_id: currentUserId,
        invitee_id: member!.id,
        status: "pending",
      }))

      if (memberInvitations.length > 0) {
        const { error: invitationsError } = await supabase.from("team_invitations").insert(memberInvitations)

        if (invitationsError) console.error("Error creating invitations:", invitationsError)
      }

      setNewTeamName("")
      setMemberNames(["", "", ""])
      setMemberSearchResults([null, null, null])
      setSelectedMembers([null, null, null])
      setSearchErrors([null, null, null])
      setShowCreateDialog(false)
      await loadTeams()
      alert(`팀이 생성되었습니다! ${validMembers.length}명에게 초대 알림이 전송되었습니다.`)
    } catch (error) {
      console.error("Error creating team:", error)
      alert("팀 생성 중 오류가 발생했습니다.")
    } finally {
      setCreating(false)
    }
  }

  const handleJoinTeam = async (teamId: string) => {
    try {
      const { error } = await supabase.from("team_members").insert({
        team_id: teamId,
        user_id: currentUserId,
      })

      if (error) throw error

      await loadTeams()
      alert("팀에 가입했습니다!")
    } catch (error) {
      console.error("Error joining team:", error)
      alert("팀 가입 중 오류가 발생했습니다.")
    }
  }

  const handleLeaveTeam = async (teamId: string) => {
    if (!confirm("정말로 팀을 탈퇴하시겠습니까?")) return

    try {
      const { error } = await supabase.from("team_members").delete().eq("team_id", teamId).eq("user_id", currentUserId)

      if (error) throw error

      await loadTeams()
      alert("팀을 탈퇴했습니다.")
    } catch (error) {
      console.error("Error leaving team:", error)
      alert("팀 탈퇴 중 오류가 발생했습니다.")
    }
  }

  const handleOpenCreateDialog = () => {
    const nextName = generateNextTeamName()
    setNewTeamName(nextName)
    setMemberNames(["", "", ""])
    setMemberSearchResults([null, null, null])
    setSelectedMembers([null, null, null])
    setSearchErrors([null, null, null])
    setShowCreateDialog(true)
  }

  if (loading) {
    return <div className="text-center py-8">팀 정보를 불러오는 중...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">팀 관리</h2>
          <p className="text-gray-600">4명으로 구성된 팀을 만들고 관리하세요</p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleOpenCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />새 팀 만들기
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-2 border-gray-200 shadow-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-gray-900">새 팀 만들기</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">팀 이름</label>
                <Input value={newTeamName} readOnly className="bg-gray-50 border-gray-300 text-gray-900" />
                <p className="text-xs text-gray-500 mt-1">팀 이름은 자동으로 생성됩니다</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">팀원 이름 (3명)</label>
                <div className="space-y-3">
                  {memberNames.map((name, index) => (
                    <div key={index} className="space-y-2">
                      <div className="relative">
                        <Input
                          value={name}
                          onChange={(e) => updateMemberName(index, e.target.value)}
                          placeholder={`팀원 ${index + 1} 이름`}
                          className="bg-white border-gray-300 text-gray-900 pr-8"
                        />
                        <Search className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
                      </div>

                      {searchErrors[index] && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          <span>{searchErrors[index]}</span>
                        </div>
                      )}

                      {selectedMembers[index] && (
                        <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                          <div className="font-medium text-green-800">{selectedMembers[index]!.name}</div>
                          <div className="text-green-600">{selectedMembers[index]!.email}</div>
                        </div>
                      )}

                      {memberSearchResults[index] && memberSearchResults[index]!.length > 1 && (
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          <p className="text-xs text-gray-600">여러 명이 발견되었습니다. 선택해주세요:</p>
                          {memberSearchResults[index]!.map((result, resultIndex) => (
                            <button
                              key={resultIndex}
                              onClick={() => selectMember(index, result.user)}
                              className="w-full p-2 text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-sm"
                            >
                              <div className="font-medium">{result.user.name}</div>
                              <div className="text-gray-600">{result.emailPrefix}@...</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">팀장 포함 총 4명으로 구성됩니다</p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  취소
                </Button>
                <Button
                  onClick={handleCreateTeam}
                  disabled={creating}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {creating ? "생성 중..." : "팀 만들기"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">아직 팀이 없습니다</h3>
            <p className="text-gray-600 mb-6">첫 번째 팀을 만들어보세요!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {teams.map((team) => {
            const memberCount = team.team_members.length
            const isMember = team.team_members.some((member) => member.user_id === currentUserId)
            const isLeader = team.leader_id === currentUserId
            const isFull = memberCount >= 4

            return (
              <Card key={team.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                    <div className="flex gap-2">
                      {isLeader && (
                        <Badge className="bg-purple-600">
                          <Crown className="h-3 w-3 mr-1" />
                          팀장
                        </Badge>
                      )}
                      {isMember && !isLeader && <Badge className="bg-green-600">멤버</Badge>}
                      {isFull && <Badge variant="secondary">정원마감</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{memberCount}/4명</span>
                      </div>

                      <div className="flex gap-2">
                        {isMember ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleLeaveTeam(team.id)}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <UserMinus className="h-4 w-4 mr-1" />
                            탈퇴
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleJoinTeam(team.id)}
                            disabled={isFull}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            {isFull ? "정원마감" : "가입"}
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">팀 멤버:</p>
                      <div className="space-y-1">
                        {team.team_members.map((member) => (
                          <div key={member.id} className="flex items-center justify-between text-sm">
                            <span>사용자 {member.user_id.slice(0, 8)}...</span>
                            {member.user_id === team.leader_id && (
                              <Badge variant="outline" className="text-xs">
                                팀장
                              </Badge>
                            )}
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
  )
}
