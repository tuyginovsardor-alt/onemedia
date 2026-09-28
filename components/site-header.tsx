"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Search, Bell, User, Crown, LogOut, ChevronDown } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { authClient } from "@/lib/auth-client"

type HeaderUser = {
  id: string
  name: string
  email: string
  username?: string
  image?: string
  role?: string
  isVip?: boolean
}

const links = [
  { href: "/", label: "Bosh sahifa" },
  { href: "/catalog", label: "Katalog" },
  { href: "/search", label: "AI Qidiruv" },
  { href: "/shorts", label: "Shorts" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [currentUser, setCurrentUser] = useState<HeaderUser | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const { data: session } = authClient.useSession()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    async function checkUser() {
      try {
        const res = await fetch("/api/user/me")
        const json = await res.json()
        if (json.user) {
          setCurrentUser(json.user)
          return
        }
      } catch {
        // ignore
      }

      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image || undefined,
          isVip: true,
        })
      } else {
        setCurrentUser(null)
      }
    }

    checkUser()

    const handleUpdate = () => checkUser()
    window.addEventListener("user-session-updated", handleUpdate)
    return () => window.removeEventListener("user-session-updated", handleUpdate)
  }, [session, pathname])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#070913]/90 backdrop-blur-md transition-all duration-300">
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
                  active ? "text-white" : "text-muted-foreground hover:text-white"
                )}
              >
                {active && <span className="absolute inset-0 rounded-full bg-cyan-400/15 ring-1 ring-cyan-400/40" />}
                <span className="relative">{link.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
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

          {currentUser ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 p-1 pr-3 text-xs font-bold text-white hover:border-cyan-400/50 hover:bg-white/10 transition shadow-md"
              >
                <div className="relative h-7 w-7 overflow-hidden rounded-full ring-2 ring-cyan-400/60 bg-slate-900 shrink-0">
                  <Image
                    src={currentUser.image || "/images/avatar.png"}
                    alt={currentUser.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="max-w-[100px] sm:max-w-[130px] truncate">{currentUser.name}</span>
                <Crown className="h-3.5 w-3.5 text-amber-400 fill-amber-400/30 shrink-0" />
                <ChevronDown className="h-3.5 w-3.5 text-white/50 shrink-0" />
              </button>

              {dropdownOpen && (
                <div
                  onMouseLeave={() => setDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/15 bg-slate-950/95 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 z-50 space-y-1"
                >
                  <div className="px-3 py-2 border-b border-white/10 space-y-0.5">
                    <p className="text-xs font-extrabold text-white truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-cyan-300 font-mono truncate">{currentUser.username || currentUser.email}</p>
                    <span className="inline-block rounded bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-400/30 mt-1">
                      👑 4K VIP Premium
                    </span>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-white/90 hover:bg-white/10 transition"
                  >
                    <User className="h-4 w-4 text-cyan-400" />
                    Mening Profilim
                  </Link>

                  <a
                    href="https://t.me/onemediahd_bot"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-white/90 hover:bg-white/10 transition"
                  >
                    <Crown className="h-4 w-4 text-amber-400" />
                    Bot Boshqaruvi
                  </a>

                  <Link
                    href="/api/auth/sign-out"
                    onClick={async (e) => {
                      e.preventDefault()
                      await authClient.signOut().catch(() => {})
                      await fetch("/api/auth/telegram-logout", { method: "POST" }).catch(() => {})
                      window.location.href = "/"
                    }}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition"
                  >
                    <LogOut className="h-4 w-4" />
                    Chiqish
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-2 text-xs font-extrabold text-slate-950 hover:bg-cyan-300 transition shadow-md shadow-cyan-400/20"
            >
              <User className="h-4 w-4" /> Kirish
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
