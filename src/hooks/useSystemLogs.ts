import { useCallback, useState } from "react"
import type { Dispatch, SetStateAction } from "react"
import type { LogLevel } from "../shared/domain/app"
import type { AppLogEntry } from "../app/types"
import { useApiBridge } from "./useApiBridge"

const LOG_PAGE_SIZE = 50

const normalizeLogLevel = (level?: string): LogLevel => {
  if (level === "error" || level === "warn" || level === "success") return level
  return "info"
}

type UseSystemLogsResult = {
  statusLog: AppLogEntry[]
  setStatusLog: Dispatch<SetStateAction<AppLogEntry[]>>
  logPage: number
  logPageSize: number
  logTotal: number
  setLogTotal: Dispatch<SetStateAction<number>>
  loadLogs: (page?: number) => Promise<void>
  clearLogs: () => Promise<void>
}

export const useSystemLogs = (): UseSystemLogsResult => {
  const api = useApiBridge()
  const [statusLog, setStatusLog] = useState<AppLogEntry[]>([])
  const [logPage, setLogPage] = useState(1)
  const [logTotal, setLogTotal] = useState(0)

  const loadLogs = useCallback(async (page = 1): Promise<void> => {
    const offset = (page - 1) * LOG_PAGE_SIZE
    const logs = await api.getSystemLogs({ limit: LOG_PAGE_SIZE, offset })
    const total = await api.getSystemLogCount()
    setLogTotal(total || 0)
    setLogPage(page)
    setStatusLog(
      (logs || []).map((entry) => ({
        id: entry.id ?? Date.now(),
        level: normalizeLogLevel(entry.level),
        message: entry.message || "",
        timestamp: entry.timestamp || new Date().toISOString(),
        time: new Date(entry.timestamp || Date.now()).toLocaleTimeString()
      }))
    )
  }, [])

  const clearLogs = useCallback(async () => {
    await api.clearSystemLogs()
    setStatusLog([])
    setLogTotal(0)
    setLogPage(1)
  }, [])

  return {
    statusLog,
    setStatusLog,
    logPage,
    logPageSize: LOG_PAGE_SIZE,
    logTotal,
    setLogTotal,
    loadLogs,
    clearLogs
  }
}
