import { pool, hasDatabaseUrl } from "./index"

let initialized = false

export async function ensureDatabaseTables() {
  if (initialized || !hasDatabaseUrl) return
  try {
    const client = await pool.connect()
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS "user" (
          "id" text PRIMARY KEY,
          "name" text NOT NULL,
          "email" text NOT NULL UNIQUE,
          "emailVerified" boolean NOT NULL DEFAULT false,
          "image" text,
          "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
          "updatedAt" timestamp with time zone NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS "session" (
          "id" text PRIMARY KEY,
          "expiresAt" timestamp with time zone NOT NULL,
          "token" text NOT NULL UNIQUE,
          "createdAt" timestamp with time zone NOT NULL,
          "updatedAt" timestamp with time zone NOT NULL,
          "ipAddress" text,
          "userAgent" text,
          "userId" text NOT NULL
        );

        CREATE TABLE IF NOT EXISTS "account" (
          "id" text PRIMARY KEY,
          "accountId" text NOT NULL,
          "providerId" text NOT NULL,
          "userId" text NOT NULL,
          "accessToken" text,
          "refreshToken" text,
          "idToken" text,
          "accessTokenExpiresAt" timestamp with time zone,
          "refreshTokenExpiresAt" timestamp with time zone,
          "scope" text,
          "password" text,
          "createdAt" timestamp with time zone NOT NULL,
          "updatedAt" timestamp with time zone NOT NULL
        );

        CREATE TABLE IF NOT EXISTS "verification" (
          "id" text PRIMARY KEY,
          "identifier" text NOT NULL,
          "value" text NOT NULL,
          "expiresAt" timestamp with time zone NOT NULL,
          "createdAt" timestamp with time zone,
          "updatedAt" timestamp with time zone
        );

        CREATE TABLE IF NOT EXISTS "profile" (
          "id" text PRIMARY KEY,
          "userId" text NOT NULL UNIQUE,
          "bio" text NOT NULL DEFAULT '',
          "phone" text NOT NULL DEFAULT '',
          "location" text NOT NULL DEFAULT '',
          "website" text NOT NULL DEFAULT '',
          "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
          "updatedAt" timestamp with time zone NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS "payment_request" (
          "id" text PRIMARY KEY,
          "userId" text NOT NULL,
          "plan" text NOT NULL,
          "amountUzs" integer NOT NULL,
          "receiptPathname" text NOT NULL,
          "transactionId" text NOT NULL,
          "status" text NOT NULL DEFAULT 'pending',
          "adminNote" text NOT NULL DEFAULT '',
          "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
          "updatedAt" timestamp with time zone NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS "media" (
          "id" text PRIMARY KEY,
          "title" text NOT NULL,
          "originalTitle" text,
          "type" text NOT NULL DEFAULT 'movie',
          "year" integer NOT NULL DEFAULT 2025,
          "rating" text NOT NULL DEFAULT '8.5',
          "duration" text NOT NULL DEFAULT '1h 50m',
          "quality" text NOT NULL DEFAULT '4K',
          "ageRating" text NOT NULL DEFAULT '16+',
          "country" text NOT NULL DEFAULT 'AQSH',
          "language" text NOT NULL DEFAULT 'O''zbekcha (Dublyaj)',
          "genres" text NOT NULL DEFAULT 'Jangari',
          "posterUrl" text NOT NULL DEFAULT '',
          "posterFileId" text DEFAULT '',
          "backdropUrl" text DEFAULT '',
          "trailerUrl" text DEFAULT '',
          "synopsis" text NOT NULL DEFAULT '',
          "director" text NOT NULL DEFAULT '',
          "cast" text NOT NULL DEFAULT '',
          "dubbingStudio" text NOT NULL DEFAULT 'OneMedia Dublyaj',
          "season" integer DEFAULT 1,
          "animeStatus" text DEFAULT 'completed',
          "totalEpisodes" integer DEFAULT 1,
          "telegramStorageId" text DEFAULT '',
          "viewsCount" integer DEFAULT 0,
          "featured" boolean DEFAULT false,
          "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
          "updatedAt" timestamp with time zone NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS "media_episode" (
          "id" text PRIMARY KEY,
          "mediaId" text NOT NULL,
          "episodeNumber" integer NOT NULL DEFAULT 1,
          "title" text NOT NULL,
          "duration" text NOT NULL DEFAULT '24 daq',
          "telegramFileId" text DEFAULT '',
          "posterFileId" text DEFAULT '',
          "videoUrl" text DEFAULT '',
          "quality" text DEFAULT '4K',
          "createdAt" timestamp with time zone NOT NULL DEFAULT now()
        );
      `)
      initialized = true
    } finally {
      client.release()
    }
  } catch (err) {
    console.error("Neon database initialization check:", (err as Error).message)
  }
}
