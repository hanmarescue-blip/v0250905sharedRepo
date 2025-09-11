import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import MyReservationsList from "@/components/my-reservations-list"

export default async function MyReservationsPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/signin")
  }

  // 사용자의 예약 목록 가져오기
  const { data: reservations } = await supabase
    .from("reservations")
    .select(`
      *,
      spaces (
        name,
        location
      )
    `)
    .eq("user_id", user.id)
    .order("reservation_date", { ascending: false })
    .order("start_time", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">내 예약 현황</h1>
          <p className="text-lg text-gray-600">예약 내역을 확인하고 관리하세요</p>
        </div>

        <MyReservationsList reservations={reservations || []} />
      </div>
    </div>
  )
}
