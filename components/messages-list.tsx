"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, Plus, Mail, MailOpen } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
  sender: { email: string }
  receiver: { email: string }
}

interface ContactableUser {
  id: string
  email: string
}

interface MessagesListProps {
  messages: Message[]
  currentUserId: string
  contactableUsers: ContactableUser[]
}

export default function MessagesList({
  messages: initialMessages,
  currentUserId,
  contactableUsers,
}: MessagesListProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [showComposeDialog, setShowComposeDialog] = useState(false)
  const [newMessage, setNewMessage] = useState({ receiverEmail: "", content: "" })
  const [sending, setSending] = useState(false)

  const handleSendMessage = async () => {
    if (!newMessage.receiverEmail.trim() || !newMessage.content.trim()) return

    setSending(true)
    try {
      // 이메일로 사용자 ID 찾기 (실제로는 별도 API 필요)
      const receiverId = contactableUsers.find((user) => user.email === newMessage.receiverEmail)?.id

      if (!receiverId) {
        alert("해당 이메일의 사용자를 찾을 수 없습니다.")
        return
      }

      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: currentUserId,
          receiver_id: receiverId,
          content: newMessage.content,
        })
        .select(`
          *,
          sender:sender_id (email),
          receiver:receiver_id (email)
        `)
        .single()

      if (error) {
        alert("메시지 전송 중 오류가 발생했습니다: " + error.message)
      } else {
        setMessages((prev) => [data, ...prev])
        setNewMessage({ receiverEmail: "", content: "" })
        setShowComposeDialog(false)
        alert("메시지가 전송되었습니다!")
      }
    } catch (error) {
      alert("메시지 전송 중 오류가 발생했습니다.")
    } finally {
      setSending(false)
    }
  }

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await supabase.from("messages").update({ is_read: true }).eq("id", messageId)

      setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, is_read: true } : msg)))
    } catch (error) {
      console.error("메시지 읽음 처리 중 오류:", error)
    }
  }

  const receivedMessages = messages.filter((msg) => msg.receiver_id === currentUserId)
  const sentMessages = messages.filter((msg) => msg.sender_id === currentUserId)
  const unreadCount = receivedMessages.filter((msg) => !msg.is_read).length

  return (
    <div className="space-y-6">
      {/* 메시지 작성 버튼 */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Badge variant="outline" className="text-sm">
            받은 메시지: {receivedMessages.length}개
          </Badge>
          <Badge variant="outline" className="text-sm">
            보낸 메시지: {sentMessages.length}개
          </Badge>
          {unreadCount > 0 && <Badge className="bg-red-600">읽지 않음: {unreadCount}개</Badge>}
        </div>

        <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              메시지 작성
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 메시지 작성</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">받는 사람 (이메일)</label>
                <Input
                  value={newMessage.receiverEmail}
                  onChange={(e) => setNewMessage((prev) => ({ ...prev, receiverEmail: e.target.value }))}
                  placeholder="받는 사람의 이메일을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">메시지 내용</label>
                <Textarea
                  value={newMessage.content}
                  onChange={(e) => setNewMessage((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="메시지 내용을 입력하세요"
                  rows={4}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowComposeDialog(false)}>
                  취소
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={sending || !newMessage.receiverEmail.trim() || !newMessage.content.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sending ? "전송 중..." : "전송"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 메시지 목록 */}
      {messages.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">메시지가 없습니다</h3>
          <p className="text-gray-600 mb-6">첫 번째 메시지를 보내보세요!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => {
            const isReceived = message.receiver_id === currentUserId
            const otherUser = isReceived ? message.sender : message.receiver

            return (
              <Card
                key={message.id}
                className={`${
                  isReceived && !message.is_read ? "border-orange-300 bg-orange-50" : ""
                } hover:shadow-md transition-shadow`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {isReceived ? (
                        <>
                          <Mail className="h-5 w-5 text-blue-600" />
                          <span className="text-blue-600">받은 메시지</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 text-green-600" />
                          <span className="text-green-600">보낸 메시지</span>
                        </>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {isReceived && !message.is_read && <Badge className="bg-red-600">읽지 않음</Badge>}
                      <span className="text-sm text-gray-500">
                        {format(new Date(message.created_at), "M월 d일 HH:mm", { locale: ko })}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">
                      {isReceived ? "보낸 사람" : "받는 사람"}: {otherUser.email}
                    </p>
                  </div>
                  <p className="text-gray-900 whitespace-pre-wrap">{message.content}</p>

                  {isReceived && !message.is_read && (
                    <div className="mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAsRead(message.id)}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        <MailOpen className="h-4 w-4 mr-1" />
                        읽음 처리
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
