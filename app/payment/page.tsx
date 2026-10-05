import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getPaymentCards, getSubscriptionPlans, getManualReceipts } from "@/lib/admin-store"
import { SubscriptionsView } from "@/components/subscriptions-view"

export const dynamic = "force-dynamic"

export default async function PaymentPage() {
  const reqHeaders = await headers()
  const session = await auth.api.getSession({ headers: reqHeaders }).catch(() => null)

  const cards = getPaymentCards().filter((c) => c.active)
  const plans = getSubscriptionPlans()
  const allReceipts = getManualReceipts()
  const myReceipts = session?.user
    ? allReceipts.filter((r) => r.userEmail === session.user.email)
    : allReceipts.slice(0, 3)

  return <SubscriptionsView plans={plans} cards={cards} myReceipts={myReceipts} />
}
