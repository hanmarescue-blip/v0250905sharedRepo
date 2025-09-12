"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Calendar, MessageCircle, Trophy } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Header } from "@/components/header"
import TeamManagement from "@/components/team-management"
import TeamMeeting from "@/components/team-meeting"

interface ClubMember {
  user_id: string
  joined_at: string
}

interface Club {
  id: string
  name: string
  description: string | null
  creator_id: string
  created_at: string
  group_members: ClubMember[]
}

interface ClubLayoutProps {
  club: Club
  currentUserId: string
}

export default function ClubLayout({ club, currentUserId }: ClubLayoutProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "teams" | "meetings">("overview")
  const isCreator = club.creator_id === currentUserId
  const memberCount = club.group_members?.length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex gap-6">
          {/* 사이드바 */}
          <div className="w-64 space-y-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{club.name}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{memberCount}명</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <nav className="space-y-1">
                  <Button
                    variant={activeTab === "overview" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("overview")}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    동호회 정보
                  </Button>
                  <Button
                    variant={activeTab === "teams" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("teams")}
                  >
                    <Users className="h-4 w-4 mr-2" />팀
                  </Button>
                  <Button
                    variant={activeTab === "meetings" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("meetings")}
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    팀미팅
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="flex-1">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* 동호회 헤더 */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-3xl mb-2">{club.name}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{memberCount}명</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>개설일: {format(new Date(club.created_at), "yyyy년 M월 d일", { locale: ko })}</span>
                          </div>
                        </div>
                      </div>
                      {isCreator && <Badge className="bg-purple-600">동호회장</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">{club.description || "동호회 설명이 없습니다."}</p>
                  </CardContent>
                </Card>

                {/* 동호회 멤버 목록 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      동호회 멤버 ({memberCount}명)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(club.group_members || []).map((member) => (
                        <div
                          key={member.user_id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">사용자 {member.user_id.slice(0, 8)}...</p>
                            <p className="text-sm text-gray-600">
                              가입일: {format(new Date(member.joined_at), "yyyy년 M월 d일", { locale: ko })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {member.user_id === club.creator_id && <Badge variant="outline">동호회장</Badge>}
                            {member.user_id === currentUserId && <Badge className="bg-green-600">나</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "teams" && <TeamManagement clubId={club.id} currentUserId={currentUserId} />}

            {activeTab === "meetings" && <TeamMeeting clubId={club.id} currentUserId={currentUserId} />}
          </div>
        </div>
      </div>
    </div>
  )
}
