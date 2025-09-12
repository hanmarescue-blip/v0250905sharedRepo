"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Plus, Calendar, Users, MapPin } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

interface TeamMeeting {
  id: string
  title: string
  description: string
  meeting_date: string
  meeting_time: string
  location: string
  club_id: string
  organizer_id: string
  meeting_type: "team_vs_team" | "team_vs_individuals"
  team1_id?: string
  team2_id?: string
  status: "scheduled" | "completed" | "cancelled"
  created_at: string
}

interface Team {
  id: string
  name: string
  team_members: { user_id: string }[]
}

interface TeamMeetingProps {
  clubId: string
  currentUserId: string
}

export default function TeamMeeting({ clubId, currentUserId }: TeamMeetingProps) {
  const [meetings, setMeetings] = useState<TeamMeeting[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(true)

  const [newMeeting, setNewMeeting] = useState({
    title: "",
    description: "",
    meeting_date: "",
    meeting_time: "",
    location: "",
    meeting_type: "team_vs_team" as "team_vs_team" | "team_vs_individuals",
    team1_id: "",
    team2_id: "",
  })

  useEffect(() => {
    loadData()
  }, [clubId])

  const loadData = async () => {
    try {
      // 팀미팅 목록 로드
      const { data: meetingsData, error: meetingsError } = await supabase
        .from("team_meetings")
        .select("*")
        .eq("club_id", clubId)
        .order("meeting_date", { ascending: false })

      if (meetingsError) throw meetingsError

      // 팀 목록 로드 (4명 정원인 팀만)
      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select(`
          id,
          name,
          team_members (user_id)
        `)
        .eq("club_id", clubId)

      if (teamsError) throw teamsError

      // 4명 정원인 팀만 필터링
      const fullTeams = teamsData?.filter((team) => team.team_members.length === 4) || []

      setMeetings(meetingsData || [])
      setTeams(fullTeams)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMeeting = async () => {
    if (!newMeeting.title.trim() || !newMeeting.meeting_date || !newMeeting.meeting_time) return

    setCreating(true)
    try {
      const meetingData = {
        title: newMeeting.title,
        description: newMeeting.description,
        meeting_date: newMeeting.meeting_date,
        meeting_time: newMeeting.meeting_time,
        location: newMeeting.location,
        club_id: clubId,
        organizer_id: currentUserId,
        meeting_type: newMeeting.meeting_type,
        team1_id: newMeeting.team1_id || null,
        team2_id: newMeeting.team2_id || null,
        status: "scheduled",
      }

      const { error } = await supabase.from("team_meetings").insert(meetingData)

      if (error) throw error

      setNewMeeting({
        title: "",
        description: "",
        meeting_date: "",
        meeting_time: "",
        location: "",
        meeting_type: "team_vs_team",
        team1_id: "",
        team2_id: "",
      })
      setShowCreateDialog(false)
      await loadData()
      alert("팀미팅이 생성되었습니다!")
    } catch (error) {
      console.error("Error creating meeting:", error)
      alert("팀미팅 생성 중 오류가 발생했습니다.")
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">팀미팅 정보를 불러오는 중...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">팀미팅</h2>
          <p className="text-gray-600">2개 팀이 만나거나, 1개 팀과 4명의 개별 회원이 만나는 자리 (총 8명)</p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />새 팀미팅 만들기
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>새 팀미팅 만들기</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">미팅 제목</label>
                <Input
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="팀미팅 제목을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">미팅 설명</label>
                <Textarea
                  value={newMeeting.description}
                  onChange={(e) => setNewMeeting((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="미팅에 대한 설명을 입력하세요"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">미팅 날짜</label>
                  <Input
                    type="date"
                    value={newMeeting.meeting_date}
                    onChange={(e) => setNewMeeting((prev) => ({ ...prev, meeting_date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">미팅 시간</label>
                  <Input
                    type="time"
                    value={newMeeting.meeting_time}
                    onChange={(e) => setNewMeeting((prev) => ({ ...prev, meeting_time: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">미팅 장소</label>
                <Input
                  value={newMeeting.location}
                  onChange={(e) => setNewMeeting((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="미팅 장소를 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">미팅 유형</label>
                <Select
                  value={newMeeting.meeting_type}
                  onValueChange={(value: "team_vs_team" | "team_vs_individuals") =>
                    setNewMeeting((prev) => ({ ...prev, meeting_type: value, team1_id: "", team2_id: "" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="team_vs_team">팀 vs 팀 (4명 + 4명)</SelectItem>
                    <SelectItem value="team_vs_individuals">팀 vs 개별회원 (4명 + 4명)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newMeeting.meeting_type === "team_vs_team" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">팀 1</label>
                    <Select
                      value={newMeeting.team1_id}
                      onValueChange={(value) => setNewMeeting((prev) => ({ ...prev, team1_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="팀을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name} (4명)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">팀 2</label>
                    <Select
                      value={newMeeting.team2_id}
                      onValueChange={(value) => setNewMeeting((prev) => ({ ...prev, team2_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="팀을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams
                          .filter((team) => team.id !== newMeeting.team1_id)
                          .map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name} (4명)
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {newMeeting.meeting_type === "team_vs_individuals" && (
                <div>
                  <label className="block text-sm font-medium mb-2">참여 팀</label>
                  <Select
                    value={newMeeting.team1_id}
                    onValueChange={(value) => setNewMeeting((prev) => ({ ...prev, team1_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="팀을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name} (4명)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-600 mt-1">개별 회원 4명은 미팅 생성 후 별도로 모집됩니다.</p>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  취소
                </Button>
                <Button onClick={handleCreateMeeting} disabled={creating}>
                  {creating ? "생성 중..." : "팀미팅 만들기"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {meetings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">아직 팀미팅이 없습니다</h3>
            <p className="text-gray-600 mb-6">첫 번째 팀미팅을 만들어보세요!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <Card key={meeting.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{meeting.title}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant={meeting.status === "scheduled" ? "default" : "secondary"}>
                      {meeting.status === "scheduled" ? "예정" : meeting.status === "completed" ? "완료" : "취소"}
                    </Badge>
                    <Badge variant="outline">
                      {meeting.meeting_type === "team_vs_team" ? "팀 vs 팀" : "팀 vs 개별"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-gray-700">{meeting.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>
                        {meeting.meeting_date} {meeting.meeting_time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{meeting.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>총 8명 참여</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <p className="text-sm text-gray-600">
                      {meeting.meeting_type === "team_vs_team"
                        ? "두 팀이 만나는 미팅입니다."
                        : "한 팀과 개별 회원들이 만나는 미팅입니다."}
                    </p>
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
