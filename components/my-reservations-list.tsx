"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, CreditCard, Calendar, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { format, isToday, isBefore, parseISO } from "date-fns"
import { ko } from "date-fns/locale"

interface Reservation {
  id: string
  reservation_date: string
  start_time: string
  end_time: string
  total_amount: number
  status: "confirmed" | "cancelled"
  created_at: string
  spaces: {
    name: string
    location: string
  }
}

interface MyReservationsListProps {
  reservations: Reservation[]
}

export default function MyReservationsList({ reservations: initialReservations }: MyReservationsListProps) {
  const [reservations, setReservations] = useState(initialReservations)
  const [cancelling, setCancelling] = useState<string | null>(null)

  const canCancel = (reservationDate: string): boolean => {
    const resDate = parseISO(reservationDate)
    return !isToday(resDate) && !isBefore(resDate, new Date())
  }

  const handleCancel = async (reservationId: string) => {
    if (!confirm("정말로 예약을 취소하시겠습니까?")) return

    setCancelling(reservationId)
    try {
      const { error } = await supabase.from("reservations").update({ status: "cancelled" }).eq("id", reservationId)

      if (error) {
        alert("취소 중 오류가 발생했습니다: " + error.message)
      } else {
        setReservations((prev) =>
          prev.map((res) => (res.id === reservationId ? { ...res, status: "cancelled" as const } : res)),
        )
        alert("예약이 취소되었습니다.")
      }
    } catch (error) {
      alert("취소 중 오류가 발생했습니다.")
    } finally {
      setCancelling(null)
    }
  }

  const getStatusBadge = (status: string, reservationDate: string) => {
    const resDate = parseISO(reservationDate)
    const isPast = isBefore(resDate, new Date()) && !isToday(resDate)

    if (status === "cancelled") {
      return <Badge variant="destructive">취소됨</Badge>
    } else if (isPast) {
      return <Badge variant="secondary">완료</Badge>
    } else {
      return (
        <Badge variant="default" className="bg-green-600">
          예약 확정
        </Badge>
      )
    }
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">예약 내역이 없습니다</h3>
        <p className="text-gray-600 mb-6">첫 번째 공간 예약을 해보세요!</p>
        <Button onClick={() => (window.location.href = "/reservations")} className="bg-orange-600 hover:bg-orange-700">
          예약하러 가기
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reservations.map((reservation) => (
        <Card key={reservation.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-600" />
                {reservation.spaces.name}
              </CardTitle>
              {getStatusBadge(reservation.status, reservation.reservation_date)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{format(parseISO(reservation.reservation_date), "yyyy년 M월 d일 (E)", { locale: ko })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>
                    {reservation.start_time} ~ {reservation.end_time}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CreditCard className="h-4 w-4" />
                  <span className="font-semibold">{reservation.total_amount.toLocaleString()}원</span>
                </div>
              </div>

              <div className="flex flex-col justify-between">
                <p className="text-sm text-gray-500 mb-2">{reservation.spaces.location}</p>

                {reservation.status === "confirmed" && canCancel(reservation.reservation_date) && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(reservation.id)}
                      disabled={cancelling === reservation.id}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      {cancelling === reservation.id ? "취소 중..." : "예약 취소"}
                    </Button>
                  </div>
                )}

                {reservation.status === "confirmed" && !canCancel(reservation.reservation_date) && (
                  <p className="text-xs text-gray-500">당일 취소는 불가합니다</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
