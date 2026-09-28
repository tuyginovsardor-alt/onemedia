"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Send, UserCheck, Loader2, Sparkles, CheckCircle2 } from 'lucide-react'

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
  const [pollStatus, setPollStatus] = useState<string | null>(null)
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null)

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

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current)
    }
  }, [])

  async function handleTelegramLogin() {
    setLoading(true)
    setPollStatus("Botingizga ulanmoqda...")

    try {
      // 1. Inside Telegram WebApp
      if (tgUser) {
        const res = await fetch("/api/auth/telegram-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tgUser),
        })
        const data = await res.json()
        if (data.success) {
          router.push(redirectTo)
          router.refresh()
          return
        }
      }

      // 2. Outside Telegram WebApp -> Start Token Polling Flow
      const startRes = await fetch("/api/auth/telegram-start-login", { method: "POST" })
      const startData = await startRes.json()

      if (startData.token && startData.botUrl) {
        setPollStatus("🟡 Bot ochildi. Botda START tugmasini bosing...")

        // Open Telegram bot
        window.open(startData.botUrl, "_blank")

        // Poll status every 1.5s
        if (pollTimerRef.current) clearInterval(pollTimerRef.current)
        pollTimerRef.current = setInterval(async () => {
          try {
            const pollRes = await fetch(`/api/auth/telegram-poll-login?token=${startData.token}`)
            const pollData = await pollRes.json()

            if (pollData.status === "authenticated") {
              if (pollTimerRef.current) clearInterval(pollTimerRef.current)
              setPollStatus("🎉 Muvaffaqiyatli kirdingiz! Profilga o'tilmoqda...")
              setTimeout(() => {
                router.push(redirectTo)
                router.refresh()
                window.location.href = redirectTo
              }, 800)
            }
          } catch {
            // ignore
          }
        }, 1500)
      }
    } catch (err) {
      console.error("Telegram login error", err)
      setLoading(false)
      setPollStatus(null)
    }
  }

  return (
    <div className="space-y-2.5">
      {tgUser ? (
        <button
          type="button"
          disabled={loading}
          onClick={handleTelegramLogin}
          className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-cyan-400 py-3.5 text-xs sm:text-sm font-extrabold text-slate-950 hover:bg-cyan-300 active:scale-95 transition shadow-lg shadow-cyan-400/25"
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
          onClick={handleTelegramLogin}
          className="w-full flex items-center justify-center gap-2.5 rounded-2xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500/20 via-cyan-400/10 to-purple-500/20 py-3.5 text-xs sm:text-sm font-extrabold text-cyan-300 hover:border-cyan-400 hover:bg-cyan-400/20 active:scale-95 transition shadow-lg shadow-cyan-500/10"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
          ) : (
            <Send className="h-4 w-4 text-cyan-400" />
          )}
          <span>{loading ? "Bot orqali kirilmoqda..." : "Telegram orqali 1-bosishda kirish"}</span>
        </button>
      )}

      {pollStatus && (
        <div className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 p-2.5 text-center text-[11px] font-semibold text-cyan-300 animate-pulse flex items-center justify-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          <span>{pollStatus}</span>
        </div>
      )}
    </div>
  )
}
