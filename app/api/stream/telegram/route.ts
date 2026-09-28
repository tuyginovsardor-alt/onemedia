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
    if (ep) {
      if (ep.telegramFileId && token) {
        const fileInfo = await resolveTelegramFilePath(ep.telegramFileId)
        if (fileInfo) {
          targetUrl = `https://api.telegram.org/file/bot${token}/${fileInfo.filePath}`
        }
      }
      if (!targetUrl && ep.videoUrl) {
        targetUrl = ep.videoUrl
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

  // 3. Fallback demo video with full Range / seek support
  if (!targetUrl) {
    targetUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  }

  // Handle Range requests for video seeking (e.g. at minute 60)
  const rangeHeader = request.headers.get("range")
  const headers: Record<string, string> = {}
  if (rangeHeader) {
    headers["range"] = rangeHeader
  }

  try {
    const videoResponse = await fetch(targetUrl, {
      headers,
      cache: "no-store",
    })

    if (!videoResponse.ok && videoResponse.status !== 206) {
      // If Telegram link expired, invalidate cache and retry once
      if (fileId) {
        telegramFileCache.delete(fileId)
      }
      return NextResponse.redirect(targetUrl)
    }

    const responseHeaders = new Headers()
    responseHeaders.set("Content-Type", videoResponse.headers.get("Content-Type") || "video/mp4")
    responseHeaders.set("Accept-Ranges", "bytes")

    const contentRange = videoResponse.headers.get("Content-Range")
    if (contentRange) {
      responseHeaders.set("Content-Range", contentRange)
    }

    const contentLength = videoResponse.headers.get("Content-Length")
    if (contentLength) {
      responseHeaders.set("Content-Length", contentLength)
    }

    responseHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate")

    return new Response(videoResponse.body, {
      status: videoResponse.status,
      statusText: videoResponse.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
    // Graceful fallback: redirect directly to the URL
    return NextResponse.redirect(targetUrl)
  }
}
