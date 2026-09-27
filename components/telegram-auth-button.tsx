"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Send, CheckCircle2, Sparkles, UserCheck } from 'lucide-react'

type TelegramUser = {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
}

export function TelegramAuthButton({ redirectTo = "/profile" }: { redirectTo?: string }) {
  const router = useRouter()
  const [tgUser, setTgUser] = useState<TelegramUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [autoAttempted, setAutoAttempted] = useState(false)

  useEffect(() => {
    // Check if running inside Telegram WebApp
    try {
      const tg = (window as any).Telegram?.WebApp
      if (tg) {
        tg.ready()
        tg.expand()
        const user = tg.initDataUnsafe?.user
        if (user) {
          setTgUser(user)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  async function handleTelegramLogin(userToLogin?: TelegramUser) {
    const user = userToLogin || tgUser
    setLoading(true)

    try {
      // If we have Telegram WebApp user
      if (user) {
        const res = await fetch("/api/auth/telegram-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        })
        const data = await res.json()
        if (data.success) {
          if (data.isAdmin && redirectTo === "/profile") {
            router.push("/admin/tg")
          } else {
            router.push(redirectTo)
          }
          router.refresh()
          return
        }
      }

      // If outside Telegram, redirect to Telegram Bot with start payload
      window.location.href = "https://t.me/onemediahd_bot?start=web_login"
    } catch (err) {
      console.error("Telegram login error", err)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      {tgUser ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => handleTelegramLogin()}
          className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-cyan-400 py-3 text-xs sm:text-sm font-extrabold text-slate-950 hover:bg-cyan-300 active:scale-95 transition shadow-lg shadow-cyan-400/20"
        >
          <UserCheck className="h-4 w-4" />
          {loading
            ? "Kirilmoqda..."
            : `${tgUser.first_name} sifatida kirish (${tgUser.username ? `@${tgUser.username}` : "Telegram"})`}
        </button>
      ) : (
        <button
          type="button"
          disabled={loading}
          onClick={() => handleTelegramLogin()}
          className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-cyan-400/40 bg-cyan-400/10 py-3 text-xs sm:text-sm font-bold text-cyan-300 hover:bg-cyan-400/20 active:scale-95 transition shadow-md shadow-cyan-400/10"
        >
          <Send className="h-4 w-4 text-cyan-400" />
          {loading ? "Ulanmoqda..." : "Telegram orqali 1 bosishda kirish"}
        </button>
      )}

      {tgUser && (
        <p className="text-center text-[10px] text-cyan-400/80 font-medium">
          Telegram hisobingiz aniqlandi. Bitta bosishda tizimga kiring!
        </p>
      )}
    </div>
  )
}
