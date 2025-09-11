"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Users,
  CreditCard,
  Clock,
  Car,
  Coffee,
  ExternalLink,
  Camera,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react"
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

interface SpaceDetailsProps {
  space: Space
}

export default function SpaceDetails({ space }: SpaceDetailsProps) {
  const router = useRouter()
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)

  const handleReservation = () => {
    router.push("/reservations")
  }

  const handleMapClick = () => {
    if (space.naver_map_url) {
      window.open(space.naver_map_url, "_blank")
    }
  }

  const openPhotoModal = (index: number) => {
    setSelectedPhotoIndex(index)
  }

  const closePhotoModal = () => {
    setSelectedPhotoIndex(null)
  }

  const navigatePhoto = (direction: "prev" | "next") => {
    if (selectedPhotoIndex === null) return

    if (direction === "prev") {
      setSelectedPhotoIndex(selectedPhotoIndex > 0 ? selectedPhotoIndex - 1 : space.space_photos.length - 1)
    } else {
      setSelectedPhotoIndex(selectedPhotoIndex < space.space_photos.length - 1 ? selectedPhotoIndex + 1 : 0)
    }
  }

  // 샘플 사진 생성 (실제 사진이 없는 경우)
  const samplePhotos = space.space_photos.length > 0 ? space.space_photos : generateSamplePhotos(space.name)

  return (
    <div className="space-y-8">
      {/* 뒤로가기 버튼 */}
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ChevronLeft className="h-4 w-4 mr-2" />
        뒤로가기
      </Button>

      {/* 공간 헤더 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-4xl mb-4">{space.name}</CardTitle>
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <MapPin className="h-5 w-5" />
                <span>{space.location}</span>
              </div>
              <div className="flex flex-wrap gap-4">
                <Badge variant="outline" className="text-sm">
                  <Users className="h-4 w-4 mr-1" />
                  최대 {space.capacity}명
                </Badge>
                <Badge variant="outline" className="text-sm">
                  <CreditCard className="h-4 w-4 mr-1" />
                  {space.hourly_rate.toLocaleString()}원/시간
                </Badge>
                <Badge variant="outline" className="text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  06:00 ~ 22:00
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleMapClick}
                variant="outline"
                className="border-blue-300 text-blue-700 bg-transparent"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                지도보기
              </Button>
              <Button onClick={handleReservation} className="bg-orange-600 hover:bg-orange-700">
                <Clock className="h-4 w-4 mr-2" />
                예약하기
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 사진 갤러리 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            공간 사진 ({samplePhotos.length}장)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {samplePhotos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {samplePhotos.map((photo, index) => (
                <div
                  key={photo.id || index}
                  className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
                  onClick={() => openPhotoModal(index)}
                >
                  <img
                    src={photo.photo_url || "/placeholder.svg"}
                    alt={photo.caption || space.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Camera className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {photo.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="text-white text-sm">{photo.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">사진이 준비 중입니다.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 상세 정보 */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* 공간 소개 */}
        <Card>
          <CardHeader>
            <CardTitle>공간 소개</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed mb-6">
              {space.description || `${space.name}은 최대 ${space.capacity}명까지 이용 가능한 공간입니다.`}
            </p>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">시설 정보</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• 최대 수용 인원: {space.capacity}명</li>
                  <li>• 시간당 이용료: {space.hourly_rate.toLocaleString()}원</li>
                  <li>• 운영 시간: 오전 6시 ~ 오후 10시</li>
                  <li>• 예약 단위: 30분</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 이용 안내 */}
        <Card>
          <CardHeader>
            <CardTitle>이용 안내</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-red-600 mb-3">주의사항</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <Car className="h-4 w-4" />
                    <span>주차 불가</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <Coffee className="h-4 w-4" />
                    <span>커피/차 반입 금지</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-amber-600 mb-3">취소 정책</h4>
                <div className="bg-amber-50 p-4 rounded-lg">
                  <p className="text-sm text-amber-800">
                    당일 취소는 불가합니다. 예약 전 일정을 신중하게 확인해주세요.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-green-600 mb-3">예약 방법</h4>
                <ol className="space-y-1 text-sm text-gray-700">
                  <li>1. 상단의 '예약하기' 버튼 클릭</li>
                  <li>2. 원하는 날짜와 시간 선택</li>
                  <li>3. 예약 정보 확인 후 결제</li>
                  <li>4. 예약 완료!</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 사진 모달 */}
      <Dialog open={selectedPhotoIndex !== null} onOpenChange={() => closePhotoModal()}>
        <DialogContent className="max-w-4xl w-full p-0">
          {selectedPhotoIndex !== null && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
                onClick={closePhotoModal}
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="relative">
                <img
                  src={samplePhotos[selectedPhotoIndex].photo_url || "/placeholder.svg"}
                  alt={samplePhotos[selectedPhotoIndex].caption || space.name}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />

                {samplePhotos.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                      onClick={() => navigatePhoto("prev")}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                      onClick={() => navigatePhoto("next")}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </>
                )}
              </div>

              {samplePhotos[selectedPhotoIndex].caption && (
                <div className="p-4 bg-gray-50">
                  <p className="text-center text-gray-700">{samplePhotos[selectedPhotoIndex].caption}</p>
                </div>
              )}

              <div className="p-4 text-center text-sm text-gray-500">
                {selectedPhotoIndex + 1} / {samplePhotos.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// 샘플 사진 생성 함수
function generateSamplePhotos(spaceName: string): SpacePhoto[] {
  const basePhotos = [
    {
      id: "sample-1",
      photo_url: `/placeholder.svg?height=400&width=600&query=${spaceName} 전체 전경`,
      caption: `${spaceName} 전체 모습`,
      display_order: 1,
    },
    {
      id: "sample-2",
      photo_url: `/placeholder.svg?height=400&width=600&query=${spaceName} 회의 테이블`,
      caption: "회의용 테이블과 의자",
      display_order: 2,
    },
    {
      id: "sample-3",
      photo_url: `/placeholder.svg?height=400&width=600&query=${spaceName} 화이트보드`,
      caption: "화이트보드 및 프레젠테이션 공간",
      display_order: 3,
    },
    {
      id: "sample-4",
      photo_url: `/placeholder.svg?height=400&width=600&query=${spaceName} 입구`,
      caption: `${spaceName} 입구`,
      display_order: 4,
    },
  ]

  return basePhotos
}
