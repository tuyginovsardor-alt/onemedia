import {
  configureTelegramWebhook,
  getTelegramWebhookInfo,
  removeTelegramWebhook,
  getTelegramBotDetails,
  resolveCurrentSiteUrl,
  sendTestMessage,
} from "@/app/actions/telegram"
import { auth } from "@/lib/auth"
import { isTelegramConfigured } from "@/lib/telegram"
import { headers } from "next/headers"
import Link from "next/link"
import { Bot, CheckCircle2, AlertTriangle, ArrowRight, Send, RefreshCw, Globe, Radio } from 'lucide-react'

export default async function TelegramAdminPage() {
  const reqHeaders = await headers()
  const session = await auth.api.getSession({ headers: reqHeaders }).catch(() => null)

  const adminEmail = process.env.ADMIN_EMAIL
  const isAuthorized = !adminEmail || session?.user?.email === adminEmail
  const configured = isTelegramConfigured()

  const detectedSiteUrl = await resolveCurrentSiteUrl()
  const detectedWebhookUrl = `${detectedSiteUrl}/api/telegram/webhook`

  const [info, botDetails] = await Promise.all([
    getTelegramWebhookInfo(),
    getTelegramBotDetails(),
  ])

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-10 text-white">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">OneMedia / Admin Panel</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Telegram Bot & Webhook</h1>
        </div>
        <Link
          href="/"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10"
        >
          ← Saytga qaytish
        </Link>
      </div>

      {!isAuthorized && (
        <div className="mb-8 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-white">Admin sifatida kirmagansiz</p>
              <p className="mt-1 text-white/70">
                Ushbu sahifani to&apos;liq boshqarish uchun <b>{adminEmail || "admin"}</b> hisobingizga kirishingiz lozim.
              </p>
              <Link
                href="/sign-in"
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-semibold text-slate-950"
              >
                Kirish sahifasi <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Bot Status Banner */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-white/50">Bot holati</p>
              <p className="mt-0.5 font-semibold">
                {botDetails ? `@${botDetails.username || botDetails.first_name}` : configured ? "Token mavjud" : "Token yo'q"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${info?.url ? "bg-emerald-400/10 text-emerald-400" : "bg-amber-400/10 text-amber-400"}`}>
              {info?.url ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-xs text-white/50">Webhook</p>
              <p className="mt-0.5 font-semibold text-white">
                {info?.url ? "Faol (Ulangan)" : "Ulanmagan"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-400/10 text-indigo-400">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-white/50">Kutilayotgan xabarlar</p>
              <p className="mt-0.5 font-semibold text-white">
                {info?.pending_update_count ?? 0} ta
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Webhook Configuration Section */}
      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Radio className="h-5 w-5 text-cyan-400" /> Webhook sozlamalari
        </h2>
        <p className="mt-1 text-sm text-white/60">
          Telegram botga yozilgan xabarlar OneMedia serveriga ushbu manzil orqali yetib keladi.
        </p>

        <div className="mt-5 rounded-xl border border-white/5 bg-black/30 p-4">
          <p className="text-xs text-white/40">Hozirgi server domeni bo&apos;yicha aniqlangan Webhook URL:</p>
          <code className="mt-1.5 block break-all font-mono text-sm text-cyan-300">
            {detectedWebhookUrl}
          </code>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <form
            action={async () => {
              'use server'
              await configureTelegramWebhook(detectedWebhookUrl)
            }}
          >
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-400/20 transition hover:bg-cyan-300 active:scale-95"
            >
              <RefreshCw className="h-4 w-4" /> Hozirgi domen bilan Webhookni ulash
            </button>
          </form>

          <form
            action={async () => {
              'use server'
              await removeTelegramWebhook()
            }}
          >
            <button
              type="submit"
              className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/5 hover:text-white"
            >
              Webhookni uzish
            </button>
          </form>
        </div>

        {/* Custom Webhook URL form */}
        <form
          action={async (formData: FormData) => {
            'use server'
            const customUrl = formData.get("customUrl") as string
            if (customUrl) {
              await configureTelegramWebhook(customUrl)
            }
          }}
          className="mt-6 border-t border-white/10 pt-5"
        >
          <label htmlFor="customUrl" className="block text-xs font-semibold text-white/60">
            Boshqa maxsus Webhook URL kiritish (ixtiyoriy)
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              id="customUrl"
              name="customUrl"
              type="url"
              placeholder="https://sizning-domen.uz/api/telegram/webhook"
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Maxsus URL ulash
            </button>
          </div>
        </form>

        {/* Current Webhook Details */}
        {info && (
          <dl className="mt-6 grid gap-4 border-t border-white/10 pt-6 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-white/40">Telegramdagi joriy Webhook URL</dt>
              <dd className="mt-1 break-all font-mono text-xs text-white/80">{info.url || "O'rnatilmagan"}</dd>
            </div>
            <div>
              <dt className="text-xs text-white/40">Kutilayotgan so&apos;rovlar soni</dt>
              <dd className="mt-1 font-semibold text-white">{info.pending_update_count}</dd>
            </div>
            {info.last_error_message && (
              <div className="sm:col-span-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                <dt className="text-xs font-semibold text-amber-300">Oxirgi xatolik (Telegramdan):</dt>
                <dd className="mt-1 font-mono text-xs text-amber-200">{info.last_error_message}</dd>
                {info.last_error_date && (
                  <p className="mt-1 text-[11px] text-white/40">
                    Vaqti: {new Date(info.last_error_date * 1000).toLocaleString("uz-UZ")}
                  </p>
                )}
              </div>
            )}
          </dl>
        )}
      </section>

      {/* Send Test Message */}
      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Send className="h-5 w-5 text-cyan-400" /> Bot orqali test xabar yuborish
        </h2>
        <p className="mt-1 text-sm text-white/60">
          Bot tokenni va xabar yetkazishni tekshirish uchun o&apos;z Telegram chat ID ingizga test xabar yuborishingiz mumkin.
        </p>

        <form
          action={async (formData: FormData) => {
            'use server'
            const chatId = formData.get("chatId") as string
            const text = formData.get("text") as string
            if (chatId && text) {
              await sendTestMessage(chatId, text)
            }
          }}
          className="mt-4 grid gap-3 sm:grid-cols-3"
        >
          <input
            name="chatId"
            type="text"
            required
            placeholder="Telegram Chat ID (masalan: 12345678)"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none"
          />
          <input
            name="text"
            type="text"
            required
            defaultValue="🎬 OneMedia botdan test xabar! Tizim muvaffaqiyatli ishga tushdi."
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-95"
          >
            <Send className="h-4 w-4" /> Yuborish
          </button>
        </form>
      </section>

      {/* Guide */}
      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-sm text-white/60">
        <h3 className="font-semibold text-white">Botning yangi imkoniyatlari:</h3>
        <ul className="mt-3 list-inside list-disc space-y-1.5 text-xs text-white/70">
          <li><b>Sayt bilan to&apos;liq integratsiya:</b> Saytdagi barcha 12 ta film va janrlar botda qidiriladi va ko&apos;rsatiladi.</li>
          <li><b>Telegram WebApp Mini-App:</b> Foydalanuvchilar Telegram ichidan chiqmasdan to&apos;liq OneMedia portalini ochib tomosha qilishlari mumkin.</li>
          <li><b>Tezkor qidiruv:</b> Foydalanuvchi film nomi (masalan: <i>Nebula</i>, <i>Tuman</i>), aktyor yoki raqam yozganda bot avtomatik topib afishasini yuboradi.</li>
          <li><b>Tugmalar va menyular:</b> Yangi kinolar, Trend, Top reyting, Janrlar, Yuklab olish va Sevimlilar to&apos;liq interaktiv ishlaydi.</li>
        </ul>
      </section>
    </main>
  )
}
