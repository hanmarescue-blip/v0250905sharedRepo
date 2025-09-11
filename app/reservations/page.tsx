import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ReservationForm from "@/components/reservation-form"

export default async function ReservationsPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/signin")
  }

  // 공간 정보 가져오기
  const { data: spaces } = await supabase.from("spaces").select("*").order("name")

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">공간 예약</h1>
          <p className="text-lg text-gray-600">원하시는 공간과 시간을 선택해주세요</p>
          <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
            <p className="text-yellow-800 font-medium">현 예약 시스템은 현재 개발중입니다.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <ReservationForm spaces={spaces || []} user={user} />
        </div>

        {/* 이용 안내 */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">이용 안내</h2>
          <div className="grid md:grid-cols-2 gap-6 text-gray-700">
            <div>
              <h3 className="font-semibold text-orange-600 mb-2">예약 시간</h3>
              <p>오전 6시 ~ 오후 10시 (30분 단위)</p>
            </div>
            <div>
              <h3 className="font-semibold text-orange-600 mb-2">요금</h3>
              <p>시간당 9,000원</p>
            </div>
            <div>
              <h3 className="font-semibold text-orange-600 mb-2">취소 정책</h3>
              <p>당일 취소는 불가합니다</p>
            </div>
            <div>
              <h3 className="font-semibold text-orange-600 mb-2">주의사항</h3>
              <p>주차 불가, 커피/차 반입 금지</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
