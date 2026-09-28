"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function TelegramWebAppAutoAuth() {
  const router = useRouter()

  useEffect(() => {
    async function autoLoginInWebApp() {
      try {
        const tg = (window as any).Telegram?.WebApp
        if (!tg) return

        tg.ready()
        tg.expand()

        const user = tg.initDataUnsafe?.user
        if (!user || !user.id) return

        // Check if user is already logged in
        const meRes = await fetch("/api/user/me")
        const meJson = await meRes.json().catch(() => ({ user: null }))

        // If not logged in or logged in as different user
        if (!meJson.user || meJson.user.telegramId !== String(user.id)) {
          const loginRes = await fetch("/api/auth/telegram-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user),
          })
          const data = await loginRes.json()
          if (data.success) {
            router.refresh()
            window.dispatchEvent(new Event("user-session-updated"))
          }
        }
      } catch (e) {
        console.error("Telegram WebApp Auto-Auth Error:", e)
      }
    }

    // Try immediately
    autoLoginInWebApp()

    // Also retry after 500ms in case Telegram WebApp SDK loads asynchronously
    const timer = setTimeout(autoLoginInWebApp, 500)
    return () => clearTimeout(timer)
  }, [router])

  return null
}
