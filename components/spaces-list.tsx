"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, CreditCard, Clock, Car, Coffee, ExternalLink, Camera } from "lucide-react"
import { useRouter } from "next/navigation"

interface SpacePhoto {
  id: string
  photo_url: string
  caption: string | null
  display_order: number
}

interface Space {
  id: string
  name: string
  location: string
  capacity: number
  hourly_rate: number
  description: string | null
  naver_map_url: string | null
  space_photos: SpacePhoto[]
}

interface SpacesListProps {
  spaces: Space[]
}

export default function SpacesList({ spaces }: SpacesListProps) {
  const router = useRouter()

  const handleViewDetails = (spaceId: string) => {
    router.push(`/spaces/${spaceId}`)
  }

  const handleReservation = () => {
    router.push("/reservations")
  }

  const handleMapClick = (mapUrl: string | null) => {
    if (mapUrl) {
      window.open(mapUrl, "_blank")
    }
  }

  return (
    <div className="space-y-8">
      {spaces.map((space) => (
        <Card key={space.id} className="overflow-hidden shadow-xl">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* 사진 섹션 */}
            <div className="relative h-80 lg:h-auto">
              {space.space_photos.length > 0 ? (
                <div className="relative h-full">
                  <img
                    src={space.space_photos[0].photo_url || "/placeholder.svg"}
                    alt={space.name}
                    className="w-full h-full object-cover"
                  />
                  {space.space_photos.length > 1 && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-black/70 text-white">
                        <Camera className="h-3 w-3 mr-1" />+{space.space_photos.length - 1}
                      </Badge>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="h-16 w-16 text-orange-600 mx-auto mb-4" />
                    <p className="text-orange-800 font-medium">사진 준비 중</p>
                  </div>
                </div>
              )}
            </div>

            {/* 정보 섹션 */}
            <div className="p-8">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-3xl text-gray-900 mb-2">{space.name}</CardTitle>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{space.location}</span>
                </div>
              </CardHeader>

              <CardContent className="p-0 space-y-6">
                {/* 기본 정보 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <Users className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">수용 인원</p>
                      <p className="font-semibold">최대 {space.capacity}명</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <CreditCard className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">시간당 요금</p>
                      <p className="font-semibold">{space.hourly_rate.toLocaleString()}원</p>
                    </div>
                  </div>
                </div>

                {/* 운영 시간 */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">운영 시간</p>
                    <p className="font-semibold">오전 6시 ~ 오후 10시 (30분 단위 예약)</p>
                  </div>
                </div>

                {/* 주의사항 */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">이용 안내</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <Car className="h-4 w-4" />
                      <span>주차 불가</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <Coffee className="h-4 w-4" />
                      <span>커피/차 반입 금지</span>
                    </div>
                  </div>
                  <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
                    당일 취소는 불가합니다. 예약 시 신중하게 선택해주세요.
                  </p>
                </div>

                {/* 설명 */}
                {space.description && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">공간 소개</h3>
                    <p className="text-gray-700 leading-relaxed">{space.description}</p>
                  </div>
                )}

                {/* 액션 버튼들 */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    onClick={() => handleViewDetails(space.id)}
                    variant="outline"
                    className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    사진 더보기
                  </Button>
                  <Button
                    onClick={() => handleMapClick(space.naver_map_url)}
                    variant="outline"
                    className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    지도에서 보기
                  </Button>
                  <Button onClick={handleReservation} className="flex-1 bg-orange-600 hover:bg-orange-700">
                    <Clock className="h-4 w-4 mr-2" />
                    예약하기
                  </Button>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
