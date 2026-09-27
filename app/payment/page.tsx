import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { ManualPaymentForm } from "@/components/manual-payment-form"
import { getMyPayments } from "@/app/actions/payment"
import { formatUzs } from "@/lib/payment"

export default async function PaymentPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")
  const payments = await getMyPayments()
  return <main className="mx-auto min-h-screen max-w-xl px-4 py-8"><p className="mb-2 text-sm text-white/50">OneMedia / Lagan</p><h1 className="mb-3 font-display text-3xl font-bold text-white">Obunani faollashtirish</h1><p className="mb-6 text-sm leading-6 text-white/60">Rekvizitlar admin tomonidan qo‘shiladi. To‘lov qilgach, tranzaksiya ID va chek rasmini yuboring.</p><ManualPaymentForm /><section className="mt-8 space-y-3"><h2 className="font-semibold text-white">Arizalarim</h2>{payments.length === 0 ? <p className="text-sm text-white/50">Hali ariza yuborilmagan.</p> : payments.map((payment) => <div key={payment.id} className="rounded-xl border border-white/10 bg-white/[.04] p-4 text-sm text-white/70"><div className="flex justify-between gap-4"><span>{payment.plan === "monthly" ? "Lagan oyiga" : "Lagan yiliga"}</span><span className="text-white">{formatUzs(payment.amountUzs)}</span></div><p className="mt-2">Holat: {payment.status === "pending" ? "Tekshirilmoqda" : payment.status === "approved" ? "Tasdiqlandi" : "Rad etildi"}</p>{payment.adminNote && <p className="mt-1 text-amber-200">{payment.adminNote}</p>}</div>)}</section></main>
}
