import { Header } from "@/components/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Users, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// 정적 공간 데이터
const spaces = [
  {
    id: "1",
    name: "염리점",
    address: "서울 마포구 숭문길 98 상가동 2층 210호",
    capacity: 8,
    hourly_rate: 9000,
    description: "깔끔하고 현대적인 회의실로 65인치 TV가 구비되어 있습니다.",
    photos: [
      {
        id: 1,
        photo_url:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%84%86%E1%85%A1%E1%84%91%E1%85%A9%E1%84%80%E1%85%AE%20%E1%84%92%E1%85%AC%E1%84%8B%E1%85%B4%E1%84%89%E1%85%B5%E1%86%AF.jpg-qKzfxfjGZQD0EsV4qvr8yN4rAJTNkW.jpeg",
        caption: "마포구 회의실 - 메인 회의 공간",
        display_order: 1,
      },
      {
        id: 2,
        photo_url:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%84%8B%E1%85%A7%E1%86%B7%E1%84%85%E1%85%B5%E1%84%83%E1%85%A9%E1%86%BC%20%E1%84%92%E1%85%AC%E1%84%8B%E1%85%B4%E1%84%89%E1%85%B5%E1%86%AF.jpg-vLWYJcoVGYnmByDWgYuEIcIlsLWRGl.jpeg",
        caption: "염리동 회의실 - 다양한 각도에서 본 모습",
        display_order: 2,
      },
      {
        id: 3,
        photo_url:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%84%80%E1%85%A9%E1%86%BC%E1%84%8B%E1%85%B2%E1%84%80%E1%85%A9%E1%86%BC%E1%84%80%E1%85%A1%E1%86%AB%20%E1%84%8B%E1%85%A7%E1%86%B7%E1%84%85%E1%85%B5%E1%84%8C%E1%85%A5%E1%86%B7.jpg-tRUIttw6nWPaqEiognFYo5TAiMqLIQ.jpeg",
        caption: "공유공간 염리점 - TV와 프레젠테이션 설비",
        display_order: 3,
      },
      {
        id: 4,
        photo_url:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%84%80%E1%85%A9%E1%86%BC%E1%84%8B%E1%85%B2%E1%84%80%E1%85%A9%E1%86%BC%E1%84%80%E1%85%A1%E1%86%AB%20%E1%84%8B%E1%85%B5%E1%86%B8%E1%84%80%E1%85%AE.jpg-xKg39UKmwvdIuqbgFMECHauYTRQs1P.jpeg",
        caption: "공유공간 입구 - 건물 외관",
        display_order: 4,
      },
      {
        id: 5,
        photo_url:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%84%8B%E1%85%A7%E1%86%B7%E1%84%85%E1%85%B5%E1%84%8C%E1%85%A5%E1%86%B7%20%E1%84%87%E1%85%A9%E1%86%A8%E1%84%83%E1%85%A9.jpg-zNZUesidMxKbPD7QLIOcsLmDmg9YqN.jpeg",
        caption: "염리점 복도 - 내부 통로",
        display_order: 5,
      },
      {
        id: 6,
        photo_url:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%84%80%E1%85%A9%E1%86%BC%E1%84%8B%E1%85%B2%E1%84%80%E1%85%A9%E1%86%BC%E1%84%80%E1%85%A1%E1%86%AB%202%E1%84%8E%E1%85%B3%E1%86%BC.jpg-cjk4b29B8vD5E0SNOeQnbJTx79iGmm.jpeg",
        caption: "공유공간 2층 - 안내 표지판",
        display_order: 6,
      },
    ],
  },
  {
    id: "2",
    name: "공덕점",
    address: "서울 마포구 마포대로 115-12 공덕삼성아파트 상가 319-1호",
    capacity: 6,
    hourly_rate: 9000,
    description: "조용하고 집중하기 좋은 환경의 회의실입니다.",
    photos: [
      {
        id: 7,
        photo_url:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_4162.jpg-IzRa2cl0lJwS4QktMTFWCTBIV8vfzF.jpeg",
        caption: "공덕점 회의실 - 프로젝터 화면",
        display_order: 1,
      },
      {
        id: 8,
        photo_url:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_4163.jpg-IsJ0nJ1hWoeSpUm6e9t0kYSZM1fwCj.jpeg",
        caption: "공덕점 회의실 - 전체 공간",
        display_order: 2,
      },
      {
        id: 9,
        photo_url:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_4160.jpg-E9QNWHmO2nwRyTFVprUwGl7ZLYYxr0.jpeg",
        caption: "3D 모델 Import 화면",
        display_order: 3,
      },
      {
        id: 10,
        photo_url:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_4165.jpg-PtysuqnTC8jnvBpSvxfkWgte0OjQ1n.jpeg",
        caption: "공덕점 회의실 - 6인용 테이블",
        display_order: 4,
      },
      {
        id: 11,
        photo_url:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_4124.jpg-4cKRmSNg4qzmMyPi2WesZtBlTeiSP9.jpeg",
        caption: "공덕점 복도 - 유리 파티션",
        display_order: 5,
      },
      {
        id: 12,
        photo_url:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_4161.jpg-mJU4noGXaRCNyjoPMZL0shYz3jEHqA.jpeg",
        caption: "사용 스크립트 화면",
        display_order: 6,
      },
    ],
  },
]

export default function SpacesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">공간 안내</h1>
          <p className="text-lg text-muted-foreground">공유공간의 두 지점을 소개합니다</p>
        </div>

        <div className="grid gap-8">
          {spaces.map((space) => (
            <Card key={space.id} className="overflow-hidden shadow-lg">
              <div className="grid md:grid-cols-2 gap-6 p-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">{space.name}</h2>
                  <p className="text-muted-foreground mb-4">{space.description}</p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{space.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">최대 {space.capacity}명까지 이용 가능</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">시간당 {space.hourly_rate.toLocaleString()}원</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <Link href="/reservations">
                      <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white mb-3">
                        예약하기
                        <Clock className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>

                  <Link href={`/spaces/${space.id}`}>
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                      상세 사진 보기
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {space.photos.slice(0, 4).map((photo, index) => (
                    <div key={photo.id} className="relative aspect-square overflow-hidden rounded-lg">
                      <Image
                        src={photo.photo_url || "/placeholder.svg"}
                        alt={photo.caption}
                        fill
                        className="object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
