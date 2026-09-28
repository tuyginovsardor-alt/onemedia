import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Sora } from 'next/font/google'
import "./globals.css"
import Script from "next/script"
import { SiteHeader } from "@/components/site-header"
import { MobileNav } from "@/components/mobile-nav"
import { SiteFooter } from "@/components/site-footer"
import { TelegramWebAppAutoAuth } from "@/components/telegram-webapp-auto-auth"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
const sora = Sora({ subsets: ["latin"], variable: "--font-display", display: "swap" })

export const metadata: Metadata = {
  title: "OneMedia — Legal Kino Portali",
  description:
    "OneMedia — O'zbekistondagi birinchi rasmiy kino portali. Sevimli film va seriallaringizni 4K sifatda, istalgan joyda va vaqtda tomosha qiling.",
  keywords: ["OneMedia", "kino", "film", "serial", "online kino", "O'zbekiston", "4K"],
  generator: "v0.app",
  referrer: "no-referrer-when-downgrade",
  other: {
    "7bed8da3d8e1b0f6e2d68e3fb300fa4753bd193f": "7bed8da3d8e1b0f6e2d68e3fb300fa4753bd193f",
  },
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
      <head>
        <meta name="referrer" content="no-referrer-when-downgrade" />
        <meta name="7bed8da3d8e1b0f6e2d68e3fb300fa4753bd193f" content="7bed8da3d8e1b0f6e2d68e3fb300fa4753bd193f" />
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body className={`${inter.variable} ${sora.variable} font-sans`}>
        <TelegramWebAppAutoAuth />
        <SiteHeader />
        <main className="min-h-screen pb-24 md:pb-0">{children}</main>
        <SiteFooter />
        <MobileNav />
      </body>
    </html>
  )
}
