import type { Dispatch, SetStateAction } from "react"
import type { AppLogEntry } from "../app/types"
import { useApiBridge } from "./useApiBridge"
import { useLogsStore } from "../stores"

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
  const statusLog = useLogsStore((state) => state.statusLog)
  const setStatusLog = useLogsStore((state) => state.setStatusLog)
  const logPage = useLogsStore((state) => state.logPage)
  const logPageSize = useLogsStore((state) => state.logPageSize)
  const logTotal = useLogsStore((state) => state.logTotal)
  const setLogTotal = useLogsStore((state) => state.setLogTotal)
  const loadLogsAction = useLogsStore((state) => state.loadLogs)
  const clearLogsAction = useLogsStore((state) => state.clearLogs)

  const loadLogs = (page = 1): Promise<void> => loadLogsAction(api, page)
  const clearLogs = (): Promise<void> => clearLogsAction(api)

  return {
    statusLog,
    setStatusLog,
    logPage,
    logPageSize,
    logTotal,
    setLogTotal,
    loadLogs,
    clearLogs
  }
}
