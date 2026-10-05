import {
  getAdmins,
  getPaymentCards,
  getSubscriptionPlans,
  getManualReceipts,
} from "@/lib/admin-store"
import { getAllMedia, setAllMedia } from "@/lib/anime-store"
import { fetchAllMediaFromNeon } from "@/lib/db/media-db"
import { redirect } from "next/navigation"
import { getAdminSessionFromCookie, getAdminProfileDetails } from "@/lib/admin-auth"
import { AdminAuthGate } from "@/components/admin-auth-gate"
import { DesktopAdminDashboard } from "@/components/desktop-admin-dashboard"

export const dynamic = "force-dynamic"

export default async function WebAdminStudioPage({
  searchParams,
}: {
  searchParams: Promise<{ uid?: string; ts?: string; sig?: string }>
}) {
  const { uid, ts, sig } = await searchParams

  // 1. If SHA-256 Token from Telegram query, redirect to Route Handler to set cookie safely
  if (uid && ts && sig) {
    redirect(`/api/auth/admin-verify?uid=${uid}&ts=${ts}&sig=${sig}&target=web`)
  }

  // 2. Check 30-day Cookie Session Cache
  const session = await getAdminSessionFromCookie()
  const isAuthenticated = Boolean(session?.authenticated)

  // 3. Block unauthorized access with AdminAuthGate
  if (!isAuthenticated) {
    return <AdminAuthGate returnUrl="/admin" />
  }

  const adminProfile = getAdminProfileDetails(session?.identifier)

  let allMedia = await fetchAllMediaFromNeon()
  if (allMedia.length > 0) {
    setAllMedia(allMedia)
  } else {
    allMedia = getAllMedia()
  }

  const admins = getAdmins()
  const cards = getPaymentCards()
  const plans = getSubscriptionPlans()
  const receipts = getManualReceipts()

  return (
    <DesktopAdminDashboard
      allMedia={allMedia}
      admins={admins}
      cards={cards}
      plans={plans}
      receipts={receipts}
      currentAdminName={adminProfile.name || "Sardor Tuyginov"}
    />
  )
}
