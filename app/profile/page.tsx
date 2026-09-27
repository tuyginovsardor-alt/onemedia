import Image from "next/image"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { Crown } from "lucide-react"
import { auth } from "@/lib/auth"
import { getProfile } from "@/app/actions/profile"
import { ProfileEditor } from "@/components/profile-editor"

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")
  const savedProfile = await getProfile()
  const profile = savedProfile ?? { bio: "", phone: "", location: "", website: "" }
  return <main>
    <div className="relative h-48 w-full md:h-60"><Image src="/images/profile-banner.png" alt="" fill className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" /></div>
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <div className="-mt-16 flex flex-col items-start gap-5 sm:flex-row sm:items-end"><div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl ring-4 ring-background glow-blue"><Image src={session.user.image || "/images/avatar.png"} alt="Profil rasmi" fill className="object-cover" /></div><div className="flex-1"><h1 className="font-display text-2xl font-bold text-white">{session.user.name}</h1><p className="text-sm text-muted-foreground">{session.user.email}</p></div><span className="flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 px-4 py-2 text-sm font-bold text-black"><Crown className="h-4 w-4" />Premium</span></div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[320px_1fr]"><aside className="rounded-2xl glass p-5 ring-1 ring-white/10"><p className="text-sm text-muted-foreground">Hisob ma’lumotlari</p><p className="mt-2 text-white">Email orqali tasdiqlangan login</p><p className="mt-6 text-xs text-muted-foreground">Profilingiz real Neon bazasiga ulangan.</p></aside><ProfileEditor initial={profile} /></div>
    </div>
  </main>
}
