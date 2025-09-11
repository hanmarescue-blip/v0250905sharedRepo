"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Users, Clock, Ban, Camera, Eye, Wifi, Monitor } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-2">편리한 공간대여 서비스</h2>
          

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              onClick={() =>
                window.open(
                  "https://map.naver.com/p/search/%EA%B3%B5%EC%9C%A0%EA%B3%B5%EA%B0%84%20%EC%97%BC%EB%A6%AC%EC%A0%90/place/1203953821?c=15.00,0,0,0,dh&isCorrectAnswer=true&placePath=/home?from=map&fromPanelNum=1&additionalHeight=76&timestamp=202508171052&locale=ko&svcName=map_pcv5&searchText=%EA%B3%B5%EC%9C%A0%EA%B3%B5%EA%B0%84%20%EC%97%BC%EB%A6%AC%EC%A0%90",
                  "_blank",
                )
              }
            >
              <MapPin className="w-5 h-5 mr-2" />
              염리점 예약하기
            </Button>
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
              onClick={() =>
                window.open(
                  "https://map.naver.com/p/search/%EA%B3%B5%EC%9C%A0%EA%B3%B5%EA%B0%84/place/1123250540?c=15.59,0,0,0,dh&placePath=/home?from=map&fromPanelNum=2&timestamp=202508171053&locale=ko&svcName=map_pcv5&searchText=%EA%B3%B5%EC%9C%A0%EA%B3%B5%EA%B0%84",
                  "_blank",
                )
              }
            >
              <MapPin className="w-5 h-5 mr-2" />
              공덕점 예약하기
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="text-center">
              <h4 className="text-lg font-semibold mb-3 text-foreground">염리점 위치</h4>
              <div className="relative w-full h-64 rounded-lg overflow-hidden shadow-md">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%84%8B%E1%85%A7%E1%86%B7%E1%84%85%E1%85%B5%E1%84%8C%E1%85%A5%E1%86%B7%20%E1%84%8C%E1%85%B5%E1%84%83%E1%85%A9-YuUcQKZqg0onyU1DYdMC938uLvlC8d.png"
                  alt="염리점 지도"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="text-center">
              <h4 className="text-lg font-semibold mb-3 text-foreground">공덕점 위치</h4>
              <div className="relative w-full h-64 rounded-lg overflow-hidden shadow-md">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%84%80%E1%85%A9%E1%86%BC%E1%84%83%E1%85%A5%E1%86%A8%E1%84%8C%E1%85%A5%E1%86%B7%20%E1%84%8C%E1%85%B5%E1%84%83%E1%85%A9-RSLJ3EIAs25PdFgRHfgh2sPc1tX4X0.png"
                  alt="공덕점 지도"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-foreground mb-4">🏢 공간 둘러보기</h3>
          <p className="text-muted-foreground mb-6">각 지점의 실제 내부 모습을 확인해보세요</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/spaces">
              <Button
                size="lg"
                className="text-lg px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <Camera className="w-5 h-5 mr-2" />
                염리점 사진 갤러리
              </Button>
            </Link>
            <Link href="/spaces">
              <Button
                size="lg"
                className="text-lg px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              >
                <Camera className="w-5 h-5 mr-2" />
                공덕점 사진 갤러리
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <div className="relative h-48 w-full">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%84%86%E1%85%A1%E1%84%91%E1%85%A9%E1%84%80%E1%85%AE%20%E1%84%92%E1%85%AC%E1%84%8B%E1%85%B4%E1%84%89%E1%85%B5%E1%86%AF.jpg-qKzfxfjGZQD0EsV4qvr8yN4rAJTNkW.jpeg"
                alt="염리점 내부 모습"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold">염리점</h3>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="space-y-3 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>서울 마포구 숭문길 98 상가동 2층 210호</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>최대 8명까지 이용 가능</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>시간당 9,000원</span>
                </div>
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-blue-600" />
                  <span>65인치 TV 구비</span>
                </div>
              </div>
              <Link href="/spaces">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                  <Eye className="w-4 h-4 mr-2" />
                  내부 사진 보기
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <div className="relative h-48 w-full">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_4162.jpg-IzRa2cl0lJwS4QktMTFWCTBIV8vfzF.jpeg"
                alt="공덕점 내부 모습"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold">공덕점</h3>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="space-y-3 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>서울 마포구 마포대로 115-12 공덕삼성아파트 상가 319-1호</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>최대 6명까지 이용 가능</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>시간당 9,000원</span>
                </div>
              </div>
              <Link href="/spaces">
                <Button className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white">
                  <Eye className="w-4 h-4 mr-2" />
                  내부 사진 보기
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-muted">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">이용 안내</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Ban className="w-4 h-4 text-destructive" />
                <span>당일 취소는 불가능합니다</span>
              </div>
              <div className="flex items-center gap-2">
                <Ban className="w-4 h-4 text-destructive" />
                <span>주차는 불가능합니다</span>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-green-600" />
                <span>무료 WiFi 이용 가능합니다</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>예약 가능 시간: 오전 6시 ~ 오후 10시 (30분 단위)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
