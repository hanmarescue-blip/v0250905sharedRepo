"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, MessageCircle, UserPlus, UserMinus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

interface Group {
  id: string
  name: string
  description: string | null
  creator_id: string
  created_at: string
  group_memberships: { user_id: string }[]
}

interface CommunityGroupsProps {
  groups: Group[]
  userGroupIds: string[]
  userId: string
}

export default function CommunityGroups({
  groups: initialGroups,
  userGroupIds: initialUserGroupIds,
  userId,
}: CommunityGroupsProps) {
  const [groups, setGroups] = useState(initialGroups)
  const [userGroupIds, setUserGroupIds] = useState(initialUserGroupIds)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newGroup, setNewGroup] = useState({ name: "", description: "" })
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState<string | null>(null)

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim()) return

    setCreating(true)
    try {
      const { data, error } = await supabase
        .from("community_groups")
        .insert({
          name: newGroup.name,
          description: newGroup.description,
          creator_id: userId,
        })
        .select()
        .single()

      if (error) {
        alert("그룹 생성 중 오류가 발생했습니다: " + error.message)
      } else {
        // 생성자를 자동으로 그룹에 추가
        await supabase.from("group_memberships").insert({
          group_id: data.id,
          user_id: userId,
        })

        const newGroupWithMembers = {
          ...data,
          group_memberships: [{ user_id: userId }],
        }

        setGroups((prev) => [newGroupWithMembers, ...prev])
        setUserGroupIds((prev) => [...prev, data.id])
        setNewGroup({ name: "", description: "" })
        setShowCreateDialog(false)
        alert("그룹이 생성되었습니다!")
      }
    } catch (error) {
      alert("그룹 생성 중 오류가 발생했습니다.")
    } finally {
      setCreating(false)
    }
  }

  const handleJoinGroup = async (groupId: string) => {
    setJoining(groupId)
    try {
      const { error } = await supabase.from("group_memberships").insert({
        group_id: groupId,
        user_id: userId,
      })

      if (error) {
        alert("그룹 가입 중 오류가 발생했습니다: " + error.message)
      } else {
        setUserGroupIds((prev) => [...prev, groupId])
        setGroups((prev) =>
          prev.map((group) =>
            group.id === groupId
              ? {
                  ...group,
                  group_memberships: [...group.group_memberships, { user_id: userId }],
                }
              : group,
          ),
        )
        alert("그룹에 가입했습니다!")
      }
    } catch (error) {
      alert("그룹 가입 중 오류가 발생했습니다.")
    } finally {
      setJoining(null)
    }
  }

  const handleLeaveGroup = async (groupId: string) => {
    if (!confirm("정말로 그룹을 탈퇴하시겠습니까?")) return

    try {
      const { error } = await supabase.from("group_memberships").delete().eq("group_id", groupId).eq("user_id", userId)

      if (error) {
        alert("그룹 탈퇴 중 오류가 발생했습니다: " + error.message)
      } else {
        setUserGroupIds((prev) => prev.filter((id) => id !== groupId))
        setGroups((prev) =>
          prev.map((group) =>
            group.id === groupId
              ? {
                  ...group,
                  group_memberships: group.group_memberships.filter((member) => member.user_id !== userId),
                }
              : group,
          ),
        )
        alert("그룹을 탈퇴했습니다.")
      }
    } catch (error) {
      alert("그룹 탈퇴 중 오류가 발생했습니다.")
    }
  }

  return (
    <div className="space-y-6">
      {/* 그룹 생성 버튼 */}
      <div className="flex justify-end">
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />새 그룹 만들기
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 커뮤니티 그룹 만들기</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">그룹 이름</label>
                <Input
                  value={newGroup.name}
                  onChange={(e) => setNewGroup((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="그룹 이름을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">그룹 설명</label>
                <Textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="그룹에 대한 설명을 입력하세요"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  취소
                </Button>
                <Button onClick={handleCreateGroup} disabled={creating || !newGroup.name.trim()}>
                  {creating ? "생성 중..." : "그룹 만들기"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 그룹 목록 */}
      {groups.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">아직 커뮤니티 그룹이 없습니다</h3>
          <p className="text-gray-600 mb-6">첫 번째 그룹을 만들어보세요!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => {
            const isMember = userGroupIds.includes(group.id)
            const memberCount = group.group_memberships.length

            return (
              <Card key={group.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    {isMember && <Badge className="bg-green-600">가입됨</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-3">{group.description || "설명이 없습니다."}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      <span>{memberCount}명</span>
                    </div>

                    <div className="flex gap-2">
                      {isMember ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => (window.location.href = `/community/${group.id}`)}
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            보기
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleLeaveGroup(group.id)}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <UserMinus className="h-4 w-4 mr-1" />
                            탈퇴
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleJoinGroup(group.id)}
                          disabled={joining === group.id}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          {joining === group.id ? "가입 중..." : "가입"}
                        </Button>
                      )}
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
