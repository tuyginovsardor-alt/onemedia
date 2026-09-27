import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Sora } from 'next/font/google'
import "./globals.css"
import { SiteHeader } from "@/components/site-header"
import { MobileNav } from "@/components/mobile-nav"
import { SiteFooter } from "@/components/site-footer"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
const sora = Sora({ subsets: ["latin"], variable: "--font-display", display: "swap" })

export const metadata: Metadata = {
  title: "OneMedia — Legal Kino Portali",
  description:
    "OneMedia — O'zbekistondagi birinchi rasmiy kino portali. Sevimli film va seriallaringizni 4K sifatda, istalgan joyda va vaqtda tomosha qiling.",
  keywords: ["OneMedia", "kino", "film", "serial", "online kino", "O'zbekiston", "4K"],
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#0b1020",
  colorScheme: "dark",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uz" className="dark">
      <body className={`${inter.variable} ${sora.variable} font-sans`}>
        <SiteHeader />
        <main className="min-h-screen pb-24 md:pb-0">{children}</main>
        <SiteFooter />
        <MobileNav />
      </body>
    </html>
  )
}
