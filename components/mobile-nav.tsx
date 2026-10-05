"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Layers, Tv, User } from 'lucide-react'
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Asosiy", icon: Home },
  { href: "/search", label: "Qidiruv", icon: Search },
  { href: "/catalog", label: "To'plam", icon: Layers },
  { href: "/shorts", label: "TV", icon: Tv },
  { href: "/profile", label: "Profil", icon: User },
]

export function MobileNav() {
  const pathname = usePathname()

  // Hide bottom nav on admin pages to keep desktop layout clean
  if (pathname.startsWith("/admin")) {
    return null
  }

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-[#090b14]/95 backdrop-blur-xl border-t border-white/10 pb-safe pt-1.5 px-3">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {navItems.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-1 px-3 transition-transform active:scale-90",
                active ? "text-[#ef4444]" : "text-white/50 hover:text-white/80"
              )}
            >
              <div className={cn(
                "relative flex h-8 w-8 items-center justify-center rounded-xl transition-all",
                active && "text-[#ef4444]"
              )}>
                <Icon className={cn("h-5 w-5", active ? "stroke-[2.5]" : "stroke-[1.8]")} />
                {active && (
                  <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-[#ef4444]" />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium tracking-tight",
                active ? "font-bold text-[#ef4444]" : "text-white/60"
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
