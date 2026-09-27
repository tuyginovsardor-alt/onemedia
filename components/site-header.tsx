"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Search, Bell, UserCircle } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { authClient } from "@/lib/auth-client"

const links = [
  { href: "/", label: "Bosh sahifa" },
  { href: "/catalog", label: "Katalog" },
  { href: "/search", label: "AI Qidiruv" },
  { href: "/shorts", label: "Shorts" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const { data: session } = authClient.useSession()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#070913]/90 backdrop-blur-md transition-all duration-300"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 md:px-8">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active ? "text-white" : "text-muted-foreground hover:text-white",
                )}
              >
                {active && (
                  <span className="absolute inset-0 rounded-full bg-primary/15 ring-1 ring-primary/40" />
                )}
                <span className="relative">{link.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/search"
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Qidiruv"
          >
            <Search className="h-5 w-5" />
          </Link>
          <button
            className="hidden h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-white md:flex"
            aria-label="Bildirishnomalar"
          >
            <Bell className="h-5 w-5" />
          </button>
          <Link
            href={session?.user ? "/profile" : "/sign-in"}
            className={cn("flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-transform hover:scale-105", session?.user ? "bg-white/10 text-white ring-1 ring-white/15" : "bg-primary text-primary-foreground")}
          >
            {session?.user ? <><UserCircle className="h-5 w-5" /><span className="max-w-24 truncate">{session.user.name}</span></> : "Kirish"}
          </Link>
        </div>
      </div>
    </header>
  )
}
