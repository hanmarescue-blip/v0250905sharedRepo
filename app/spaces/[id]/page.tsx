import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Users, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface SpacePageProps {
  params: { id: string }
}

// 정적 공간 데이터
const spacesData = {
  "1": {
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
  "2": {
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
}

export default function SpacePage({ params }: SpacePageProps) {
  const space = spacesData[params.id as keyof typeof spacesData]

  if (!space) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Link href="/spaces">
            <Button variant="outline" className="mb-4 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              공간 목록으로 돌아가기
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h1 className="text-3xl font-bold text-foreground mb-4">{space.name}</h1>
                <p className="text-muted-foreground mb-6">{space.description}</p>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm">{space.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm">최대 {space.capacity}명까지 이용 가능</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm">시간당 {space.hourly_rate.toLocaleString()}원</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-foreground mb-6">공간 사진</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {space.photos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden">
                  <div className="relative aspect-video">
                    <Image
                      src={photo.photo_url || "/placeholder.svg"}
                      alt={photo.caption}
                      fill
                      className="object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">{photo.caption}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
