import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull(),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }),
  updatedAt: timestamp("updatedAt", { withTimezone: true }),
})

export const profile = pgTable("profile", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().unique(),
  bio: text("bio").notNull().default(""),
  phone: text("phone").notNull().default(""),
  location: text("location").notNull().default(""),
  website: text("website").notNull().default(""),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
})

export const paymentRequest = pgTable("payment_request", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  plan: text("plan").notNull(),
  amountUzs: integer("amountUzs").notNull(),
  receiptPathname: text("receiptPathname").notNull(),
  transactionId: text("transactionId").notNull(),
  status: text("status").notNull().default("pending"),
  adminNote: text("adminNote").notNull().default(""),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
})

export const media = pgTable("media", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  originalTitle: text("originalTitle"),
  type: text("type").notNull().default("movie"), // movie | anime | series
  year: integer("year").notNull().default(2025),
  rating: text("rating").notNull().default("8.5"),
  duration: text("duration").notNull().default("1h 50m"),
  quality: text("quality").notNull().default("4K"),
  ageRating: text("ageRating").notNull().default("16+"),
  country: text("country").notNull().default("AQSH"),
  language: text("language").notNull().default("O'zbekcha (Dublyaj)"),
  genres: text("genres").notNull().default("Jangari"),
  posterUrl: text("posterUrl").notNull().default(""),
  posterFileId: text("posterFileId").default(""),
  backdropUrl: text("backdropUrl").default(""),
  trailerUrl: text("trailerUrl").default(""),
  synopsis: text("synopsis").notNull().default(""),
  director: text("director").notNull().default(""),
  cast: text("cast").notNull().default(""),
  dubbingStudio: text("dubbingStudio").notNull().default("OneMedia Dublyaj"),
  season: integer("season").default(1),
  animeStatus: text("animeStatus").default("completed"), // ongoing | completed
  totalEpisodes: integer("totalEpisodes").default(1),
  telegramStorageId: text("telegramStorageId").default(""), // Main Video File ID
  viewsCount: integer("viewsCount").default(0),
  featured: boolean("featured").default(false),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
})

export const mediaEpisode = pgTable("media_episode", {
  id: text("id").primaryKey(),
  mediaId: text("mediaId").notNull(),
  episodeNumber: integer("episodeNumber").notNull().default(1),
  title: text("title").notNull(),
  duration: text("duration").notNull().default("24 daq"),
  telegramFileId: text("telegramFileId").default(""),
  posterFileId: text("posterFileId").default(""),
  videoUrl: text("videoUrl").default(""),
  quality: text("quality").default("4K"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
})

export const schema = {
  user,
  session,
  account,
  verification,
  profile,
  paymentRequest,
  media,
  mediaEpisode,
}

export type Profile = typeof profile.$inferSelect
export type User = typeof user.$inferSelect
export type PaymentRequest = typeof paymentRequest.$inferSelect
export type DbMedia = typeof media.$inferSelect
export type DbMediaEpisode = typeof mediaEpisode.$inferSelect
