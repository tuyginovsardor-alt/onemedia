import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { ManualPaymentForm } from "@/components/manual-payment-form"
import { getPaymentCards, getSubscriptionPlans, getManualReceipts } from "@/lib/admin-store"
import { CreditCard, ShieldCheck, CheckCircle2, Copy } from 'lucide-react'
import Link from "next/link"

export default async function PaymentPage() {
  const reqHeaders = await headers()
  const session = await auth.api.getSession({ headers: reqHeaders }).catch(() => null)

  const cards = getPaymentCards().filter((c) => c.active)
  const plans = getSubscriptionPlans()
  const allReceipts = getManualReceipts()
  const myReceipts = session?.user
    ? allReceipts.filter((r) => r.userEmail === session.user.email)
    : allReceipts.slice(0, 3)

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-10 text-white space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">OneMedia / Obuna & VIP</p>
        <h1 className="mt-1 font-display text-3xl font-black text-white">VIP Obunani Faollashtirish</h1>
        <p className="mt-2 text-sm text-white/60 leading-relaxed">
          4K Ultra HD filmlar, yangi anime premyeralar va reklamalarsiz cheksiz tomosha qilish uchun qulay tarifni tanlang va to&apos;lov chekini yuboring.
        </p>
      </div>

      {/* Subscription Plans */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">1. Tarifni tanlang</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((pl) => (
            <div
              key={pl.id}
              className={`rounded-2xl border p-4 flex flex-col justify-between ${
                pl.popular
                  ? "border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-400/10"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div>
                {pl.popular && (
                  <span className="inline-block rounded-md bg-cyan-400 px-2 py-0.5 text-[10px] font-black text-slate-950 uppercase mb-2">
                    Eng ommabop
                  </span>
                )}
                <h3 className="font-bold text-sm text-white">{pl.name}</h3>
                <p className="mt-2 text-xl font-black text-cyan-300">
                  {pl.amountUzs.toLocaleString()} <span className="text-xs font-normal text-white/60">UZS</span>
                </p>
                <ul className="mt-3 space-y-1.5 text-[11px] text-white/70">
                  {pl.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Active Bank Cards */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white/80 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-cyan-400" /> 2. To&apos;lov rekvizitlari
        </h2>
        <p className="text-xs text-white/60">
          Quyidagi kartalardan biriga Click, Payme yoki bank ilovasi orqali to&apos;lov qiling:
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {cards.map((cd) => (
            <div key={cd.id} className="rounded-xl border border-cyan-400/20 bg-black/40 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-white/50">
                <span>{cd.bankName}</span>
                <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white">{cd.paymentType}</span>
              </div>
              <p className="font-mono text-base font-bold text-cyan-300 tracking-wider select-all">{cd.cardNumber}</p>
              <p className="text-[11px] text-white/70 font-semibold uppercase">{cd.cardHolder}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Manual Payment Form */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">3. To&apos;lov chekini yuklash</h2>
        <ManualPaymentForm />
      </section>

      {/* User's Receipts */}
      {myReceipts.length > 0 && (
        <section className="space-y-3 pt-4 border-t border-white/10">
          <h2 className="text-sm font-bold text-white">To&apos;lov arizalarim holati</h2>
          <div className="space-y-2">
            {myReceipts.map((rc) => (
              <div key={rc.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{rc.planName}</p>
                  <p className="text-white/50 text-[11px]">{rc.amountUzs.toLocaleString()} UZS • {rc.transactionNote || "Chek yuborilgan"}</p>
                </div>
                <span
                  className={`rounded-md px-2.5 py-1 text-[11px] font-bold ${
                    rc.status === "approved"
                      ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30"
                      : rc.status === "rejected"
                      ? "bg-red-400/20 text-red-300 border border-red-400/30"
                      : "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                  }`}
                >
                  {rc.status === "approved" ? "✅ Tasdiqlandi (Faol)" : rc.status === "rejected" ? "❌ Rad etildi" : "⏳ Tekshirilmoqda"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
