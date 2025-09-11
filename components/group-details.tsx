"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, MessageCircle } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

interface GroupMember {
  user_id: string
  joined_at: string
}

interface Group {
  id: string
  name: string
  description: string | null
  creator_id: string
  created_at: string
  group_members: GroupMember[]
}

interface GroupDetailsProps {
  group: Group
  currentUserId: string
}

export default function GroupDetails({ group, currentUserId }: GroupDetailsProps) {
  const isCreator = group.creator_id === currentUserId
  const memberCount = group.group_members.length

  return (
    <div className="space-y-6">
      {/* 그룹 헤더 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl mb-2">{group.name}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{memberCount}명</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>개설일: {format(new Date(group.created_at), "yyyy년 M월 d일", { locale: ko })}</span>
                </div>
              </div>
            </div>
            {isCreator && <Badge className="bg-purple-600">그룹장</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">{group.description || "그룹 설명이 없습니다."}</p>
        </CardContent>
      </Card>

      {/* 그룹 멤버 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            그룹 멤버 ({memberCount}명)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {group.group_members.map((member) => (
              <div key={member.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">사용자 {member.user_id.slice(0, 8)}...</p>
                  <p className="text-sm text-gray-600">
                    가입일: {format(new Date(member.joined_at), "yyyy년 M월 d일", { locale: ko })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {member.user_id === group.creator_id && <Badge variant="outline">그룹장</Badge>}
                  {member.user_id === currentUserId && <Badge className="bg-green-600">나</Badge>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 그룹 활동 (향후 확장 가능) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            그룹 활동
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>그룹 활동 기능은 곧 추가될 예정입니다.</p>
            <p className="text-sm">그룹 채팅, 이벤트 등의 기능을 준비 중입니다.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
