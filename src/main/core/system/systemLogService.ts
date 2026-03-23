import type { WebContents } from "electron"
import { IPC_CHANNELS } from "../../../shared/ipc/channels"
import type { DBServiceLike } from "../types"

type CreateSystemLogServiceDeps = {
  dbService: DBServiceLike
  retention: number
}

type SystemLogEntry = {
  id?: number | string
  level: string
  message: string
  timestamp: string
}

export function createSystemLogService({ dbService, retention }: CreateSystemLogServiceDeps): {
  addSystemLog: (level: string, message: string) => SystemLogEntry | null
  setLogSender: (sender: WebContents | null) => void
} {
  let logSender: WebContents | null = null

  const setLogSender = (sender: WebContents | null): void => {
    logSender = sender
  }

  const addSystemLog = (level: string, message: string): SystemLogEntry | null => {
    try {
      const timestamp = new Date().toISOString()
      const result = dbService.addSystemLog(level, message, timestamp)
      dbService.pruneSystemLogs(retention)
      const entry: SystemLogEntry = {
        id: result.lastInsertRowid,
        level,
        message,
        timestamp
      }
      if (logSender && !logSender.isDestroyed()) {
        logSender.send(IPC_CHANNELS.SYSTEM_LOG, entry)
      }
      return entry
    } catch (err) {
      console.error("Failed to add system log:", err)
      return null
    }
  }

  return { addSystemLog, setLogSender }
}
