import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getPaymentRequests, updatePaymentStatus } from "@/app/actions/admin-payments"
import { formatUzs } from "@/lib/payment"

export default async function AdminPaymentsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")
  if (session.user.email !== process.env.ADMIN_EMAIL) redirect("/")
  const requests = await getPaymentRequests()
  return <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 text-white"><div className="mb-8"><p className="text-sm text-white/50">OneMedia / Admin</p><h1 className="font-display text-3xl font-bold">Manual to‘lovlar</h1><p className="mt-2 text-sm text-white/60">UZS obuna arizalarini tekshiring va qo‘lda tasdiqlang.</p></div><div className="space-y-4">{requests.length === 0 ? <div className="rounded-2xl border border-white/10 p-8 text-center text-white/60">Hozircha to‘lov arizalari yo‘q.</div> : requests.map(({ request, email, name }) => <article key={request.id} className="grid gap-5 rounded-2xl border border-white/10 bg-white/[.04] p-5 md:grid-cols-[1fr_220px]"><div><div className="flex flex-wrap items-center gap-3"><h2 className="font-semibold">{name || email}</h2><span className="rounded-full bg-white/10 px-2.5 py-1 text-xs">{request.status}</span></div><p className="mt-2 text-sm text-white/60">{email} · {request.plan} · {formatUzs(request.amountUzs)}</p><p className="mt-2 text-sm text-white/70">Tranzaksiya: <span className="font-mono">{request.transactionId}</span></p><a className="mt-3 inline-block text-sm text-cyan-300 underline" href={`/api/payment/receipt?pathname=${encodeURIComponent(request.receiptPathname)}`} target="_blank" rel="noreferrer">Chekni ko‘rish</a>{request.adminNote && <p className="mt-3 text-sm text-amber-200">Izoh: {request.adminNote}</p>}</div><form action={updatePaymentStatus} className="space-y-3"><input type="hidden" name="id" value={request.id} /><textarea name="adminNote" placeholder="Admin izohi (ixtiyoriy)" className="min-h-20 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white" /><div className="grid grid-cols-2 gap-2"><button name="status" value="approved" className="rounded-xl bg-emerald-400 px-3 py-2 text-sm font-semibold text-black">Tasdiqlash</button><button name="status" value="rejected" className="rounded-xl bg-rose-400/90 px-3 py-2 text-sm font-semibold text-black">Rad etish</button></div></form></article>)}</div></main>
}
