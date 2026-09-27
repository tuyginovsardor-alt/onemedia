"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, LayoutGrid, Sparkles, Clapperboard, User } from 'lucide-react'
import { cn } from "@/lib/utils"

const items = [
  { href: "/", label: "Bosh", icon: Home },
  { href: "/catalog", label: "Katalog", icon: LayoutGrid },
  { href: "/search", label: "AI", icon: Sparkles },
  { href: "/shorts", label: "Shorts", icon: Clapperboard },
  { href: "/profile", label: "Profil", icon: User },
]

export function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-2xl glass-strong px-2 py-2 ring-1 ring-white/10 md:hidden">
      {items.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl px-4 py-1.5 text-[10px] font-medium transition-colors",
              active ? "text-white" : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl transition-colors",
                active && "bg-primary text-primary-foreground glow-blue",
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
            </span>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
