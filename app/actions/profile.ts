'use server'

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { profile } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

export async function getProfile() {
  const userId = await getUserId()
  return db.query.profile.findFirst({ where: eq(profile.userId, userId) })
}

export async function updateProfile(values: { bio: string; phone: string; location: string; website: string }) {
  const userId = await getUserId()
  const existing = await db.query.profile.findFirst({ where: eq(profile.userId, userId) })
  const data = {
    bio: values.bio.trim().slice(0, 500),
    phone: values.phone.trim().slice(0, 40),
    location: values.location.trim().slice(0, 120),
    website: values.website.trim().slice(0, 240),
    updatedAt: new Date(),
  }
  if (existing) {
    await db.update(profile).set(data).where(eq(profile.userId, userId))
  } else {
    await db.insert(profile).values({ id: crypto.randomUUID(), userId, ...data })
  }
  revalidatePath("/profile")
  return { ok: true }
}
