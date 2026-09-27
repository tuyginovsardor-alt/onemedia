import { configureTelegramWebhook, getTelegramWebhookInfo, removeTelegramWebhook } from "@/app/actions/telegram"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function TelegramAdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")
  if (!process.env.ADMIN_EMAIL || session.user.email !== process.env.ADMIN_EMAIL) redirect("/")

  const info = await getTelegramWebhookInfo().catch(() => null)
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10 text-white">
      <p className="mb-2 text-sm text-white/50">OneMedia / Admin</p>
      <h1 className="font-display text-3xl font-bold">Telegram bot boshqaruvi</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">Webhook botga keladigan xabarlarni OneMedia serveriga xavfsiz yetkazadi. Bot token browserga chiqarilmaydi.</p>
      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[.04] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-sm text-white/50">Webhook holati</p><p className="mt-1 font-medium">{info?.url ? "Ulangan" : "Ulanmagan"}</p></div>
          <div className="flex gap-3"><form action={configureTelegramWebhook}><button className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950">Webhook ulash</button></form><form action={removeTelegramWebhook}><button className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/70">Uzish</button></form></div>
        </div>
        {info?.url && <dl className="mt-5 grid gap-3 border-t border-white/10 pt-5 text-sm sm:grid-cols-2"><div><dt className="text-white/40">URL</dt><dd className="mt-1 break-all text-white/70">{info.url}</dd></div><div><dt className="text-white/40">Kutilayotgan update</dt><dd className="mt-1 text-white/70">{info.pending_update_count}</dd></div>{info.last_error_message && <div className="sm:col-span-2"><dt className="text-white/40">Oxirgi xato</dt><dd className="mt-1 text-amber-300">{info.last_error_message}</dd></div>}</dl>}
      </section>
    </main>
  )
}
