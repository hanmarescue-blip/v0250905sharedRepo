"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { MapPin, Users, CreditCard } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { format, isBefore } from "date-fns"
import { ko } from "date-fns/locale"
import type { User } from "@supabase/supabase-js"

interface Space {
  id: string
  name: string
  location: string
  capacity: number
  hourly_rate: number
  description: string | null
  naver_map_url: string | null
}

interface ReservationFormProps {
  spaces: Space[]
  user: User
}

interface TimeSlot {
  time: string
  available: boolean
}

export default function ReservationForm({ spaces, user }: ReservationFormProps) {
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([])
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [reserving, setReserving] = useState(false)

  // 시간 슬롯 생성 (6:00 ~ 22:00, 30분 단위)
  const generateTimeSlots = (): string[] => {
    const slots = []
    for (let hour = 6; hour < 22; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`)
      slots.push(`${hour.toString().padStart(2, "0")}:30`)
    }
    return slots
  }

  // 예약된 시간 슬롯 확인
  const checkAvailability = async (spaceId: string, date: Date) => {
    if (!date) return

    const dateString = format(date, "yyyy-MM-dd")

    const { data: reservations } = await supabase
      .from("reservations")
      .select("start_time, end_time")
      .eq("space_id", spaceId)
      .eq("reservation_date", dateString)
      .eq("status", "confirmed")

    const allSlots = generateTimeSlots()
    const availableSlots: TimeSlot[] = allSlots.map((time) => {
      const isReserved = reservations?.some((reservation) => {
        const startTime = reservation.start_time
        const endTime = reservation.end_time
        return time >= startTime && time < endTime
      })

      return {
        time,
        available: !isReserved,
      }
    })

    setAvailableSlots(availableSlots)
  }

  useEffect(() => {
    if (selectedSpace && selectedDate) {
      checkAvailability(selectedSpace.id, selectedDate)
    }
  }, [selectedSpace, selectedDate])

  const handleTimeSlotToggle = (time: string) => {
    setSelectedTimeSlots((prev) => {
      if (prev.includes(time)) {
        return prev.filter((t) => t !== time)
      } else {
        return [...prev, time].sort()
      }
    })
  }

  const calculateTotal = () => {
    if (!selectedSpace || selectedTimeSlots.length === 0) return 0
    // 30분 단위이므로 슬롯 수 * (시간당 요금 / 2)
    return selectedTimeSlots.length * (selectedSpace.hourly_rate / 2)
  }

  const handleReservation = async () => {
    if (!selectedSpace || !selectedDate || selectedTimeSlots.length === 0) return

    setReserving(true)
    try {
      // 연속된 시간 슬롯을 하나의 예약으로 처리
      const sortedSlots = [...selectedTimeSlots].sort()
      const startTime = sortedSlots[0]
      const endTime = getEndTime(sortedSlots)

      const { error } = await supabase.from("reservations").insert({
        user_id: user.id,
        space_id: selectedSpace.id,
        reservation_date: format(selectedDate, "yyyy-MM-dd"),
        start_time: startTime,
        end_time: endTime,
        total_amount: calculateTotal(),
        status: "confirmed",
      })

      if (error) {
        alert("예약 중 오류가 발생했습니다: " + error.message)
      } else {
        alert("예약이 완료되었습니다!")
        // 폼 초기화
        setSelectedTimeSlots([])
        checkAvailability(selectedSpace.id, selectedDate)
      }
    } catch (error) {
      alert("예약 중 오류가 발생했습니다.")
    } finally {
      setReserving(false)
    }
  }

  const getEndTime = (slots: string[]): string => {
    const lastSlot = slots[slots.length - 1]
    const [hour, minute] = lastSlot.split(":").map(Number)
    const endMinute = minute + 30
    if (endMinute >= 60) {
      return `${(hour + 1).toString().padStart(2, "0")}:00`
    } else {
      return `${hour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`
    }
  }

  return (
    <div className="space-y-8">
      {/* 공간 선택 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. 공간 선택</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {spaces.map((space) => (
            <Card
              key={space.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedSpace?.id === space.id ? "ring-2 ring-orange-500 bg-orange-50" : ""
              }`}
              onClick={() => setSelectedSpace(space)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  {space.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">{space.location}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>최대 {space.capacity}명</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <span>{space.hourly_rate.toLocaleString()}원/시간</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 날짜 선택 */}
      {selectedSpace && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. 날짜 선택</h2>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => isBefore(date, new Date()) || date < new Date()}
              locale={ko}
              className="rounded-md border"
            />
          </div>
        </div>
      )}

      {/* 시간 선택 */}
      {selectedSpace && selectedDate && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. 시간 선택</h2>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {availableSlots.map((slot) => (
              <Button
                key={slot.time}
                variant={selectedTimeSlots.includes(slot.time) ? "default" : "outline"}
                disabled={!slot.available}
                onClick={() => handleTimeSlotToggle(slot.time)}
                className={`h-12 ${
                  selectedTimeSlots.includes(slot.time)
                    ? "bg-orange-600 hover:bg-orange-700"
                    : slot.available
                      ? "hover:bg-orange-50 hover:border-orange-300"
                      : "opacity-50 cursor-not-allowed"
                }`}
              >
                {slot.time}
              </Button>
            ))}
          </div>

          {selectedTimeSlots.length > 0 && (
            <div className="mt-6 p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">선택된 시간</p>
                  <p className="text-sm text-gray-600">
                    {selectedTimeSlots[0]} ~ {getEndTime(selectedTimeSlots)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">총 요금</p>
                  <p className="text-2xl font-bold text-orange-600">{calculateTotal().toLocaleString()}원</p>
                </div>
              </div>

              <Button
                onClick={handleReservation}
                disabled={reserving}
                className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg font-semibold"
              >
                {reserving ? "예약 중..." : "예약하기"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
