import { NextResponse } from "next/server"
import { getTelegramBotToken } from "@/lib/telegram"
import { getMediaById, addMediaItem } from "@/lib/anime-store"
import { fetchMediaByIdFromNeon } from "@/lib/db/media-db"

// In-memory cache for Telegram file paths (valid for ~50 minutes)
type CachedTelegramFile = {
  filePath: string
  fileSize?: number
  expiresAt: number
}

const telegramFileCache = new Map<string, CachedTelegramFile>()

async function resolveTelegramFilePath(fileId: string): Promise<{ filePath: string; fileSize?: number } | null> {
  const cached = telegramFileCache.get(fileId)
  if (cached && Date.now() < cached.expiresAt) {
    return { filePath: cached.filePath, fileSize: cached.fileSize }
  }

  const token = getTelegramBotToken()
  if (!token) return null

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`, {
      cache: "no-store",
    })
    const data = await res.json()
    if (!data.ok || !data.result?.file_path) {
      return null
    }

    const info = {
      filePath: data.result.file_path,
      fileSize: data.result.file_size,
      expiresAt: Date.now() + 50 * 60 * 1000, // 50 mins
    }
    telegramFileCache.set(fileId, info)
    return info
  } catch (error) {
    console.error("Failed to resolve telegram file path", error)
    return null
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const fileId = searchParams.get("file_id")
  const mediaId = searchParams.get("media_id")
  const episodeNumber = parseInt(searchParams.get("ep") || "1", 10)
  const token = getTelegramBotToken()

  let targetUrl: string | null = null

  // 1. If mediaId is provided, look up episode
  if (mediaId) {
    let media = getMediaById(mediaId)
    if (!media) {
      const neonItem = await fetchMediaByIdFromNeon(mediaId)
      if (neonItem) {
        addMediaItem(neonItem)
        media = neonItem
      }
    }
    const ep = media?.episodes.find((e) => e.episodeNumber === episodeNumber) || media?.episodes[0]
    
    if (ep?.videoUrl) {
      targetUrl = ep.videoUrl
    } else if (media?.trailerUrl) {
      targetUrl = media.trailerUrl
    }

    const vidFileId = ep?.telegramFileId || media?.telegramStorageId
    if (!targetUrl && vidFileId && token) {
      const fileInfo = await resolveTelegramFilePath(vidFileId)
      if (fileInfo) {
        targetUrl = `https://api.telegram.org/file/bot${token}/${fileInfo.filePath}`
      }
    }
  }

  // 2. Direct fileId provided
  if (!targetUrl && fileId && token) {
    const fileInfo = await resolveTelegramFilePath(fileId)
    if (fileInfo) {
      targetUrl = `https://api.telegram.org/file/bot${token}/${fileInfo.filePath}`
    }
  }

  // 3. Fallback high-speed streaming CDN video
  if (!targetUrl) {
    targetUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  }

  // Directly redirect with 307 so browser video engine manages HTTP Range, buffering, and seeking natively
  return NextResponse.redirect(targetUrl, 307)
}
