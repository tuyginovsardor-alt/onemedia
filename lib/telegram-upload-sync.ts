// Live synchronization between Telegram Bot uploads and Web Admin Panel

export type UploadSessionData = {
  sessionId: string
  chatId?: string | number
  status: "waiting" | "received" | "saved"
  videoFileId?: string
  photoFileId?: string
  posterUrl?: string
  title?: string
  year?: number
  rating?: number
  quality?: "4K" | "FHD" | "HD"
  duration?: string
  genres?: string[]
  synopsis?: string
  type?: "movie" | "anime" | "series"
  season?: number
  episodeNumber?: number
  totalEpisodes?: number
  dubbingStudio?: string
  createdAt: number
}

// In-memory sessions map (cleaned up after 1 hour)
const sessionsMap = new Map<string, UploadSessionData>()
// User active upload sessions: chatId -> sessionId
const userActiveUploadSession = new Map<string, string>()

export function createUploadSession(customId?: string, chatId?: string | number): UploadSessionData {
  const sessionId = customId || `ups_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  const session: UploadSessionData = {
    sessionId,
    chatId,
    status: "waiting",
    createdAt: Date.now(),
  }
  sessionsMap.set(sessionId, session)
  if (chatId) {
    userActiveUploadSession.set(String(chatId), sessionId)
  }
  return session
}

export function getUploadSession(sessionId: string): UploadSessionData | undefined {
  return sessionsMap.get(sessionId)
}

export function getActiveSessionForUser(chatId: string | number): UploadSessionData | undefined {
  const sessionId = userActiveUploadSession.get(String(chatId))
  if (sessionId) {
    return sessionsMap.get(sessionId)
  }
  return undefined
}

export function setActiveSessionForUser(chatId: string | number, sessionId: string) {
  userActiveUploadSession.set(String(chatId), sessionId)
}

export function updateUploadSession(sessionId: string, data: Partial<UploadSessionData>): UploadSessionData | undefined {
  const existing = sessionsMap.get(sessionId)
  if (!existing) return undefined

  const updated: UploadSessionData = {
    ...existing,
    ...data,
    status: "received",
  }
  sessionsMap.set(sessionId, updated)
  return updated
}

export function clearUploadSession(sessionId: string) {
  const session = sessionsMap.get(sessionId)
  if (session?.chatId) {
    userActiveUploadSession.delete(String(session.chatId))
  }
  sessionsMap.delete(sessionId)
}
