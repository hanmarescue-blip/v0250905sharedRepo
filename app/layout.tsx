import type React from "react"
import type { Metadata } from "next"
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google"
import Script from "next/script"
import NotificationWrapper from "@/components/notifications/notification-wrapper"
import "./globals.css"

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
})

const notoSerifKR = Noto_Serif_KR({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "공유공간 - 편리한 공간대여 서비스",
  description: "염리점과 공덕점에서 제공하는 편리한 공간대여 서비스입니다.",
  generator: "v0.app",
  verification: {
    google: "i-tZNbjNJZgjfJTLwA_QZFOuLaPy1PcR5cKA1hG393c",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={`${notoSansKR.variable} ${notoSerifKR.variable}`}>
      <body>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-GSBXVJGEQF" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-GSBXVJGEQF');
          `}
        </Script>
        {children}
        <NotificationWrapper />
      </body>
    </html>
  )
}
