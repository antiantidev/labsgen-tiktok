import type { Dispatch, SetStateAction } from "react"
import type { AppLogEntry } from "../logs"

export type PulseLogLevel = AppLogEntry["level"]

export type PulsePageProps = {
  statusLog?: AppLogEntry[]
  setStatusLog: Dispatch<SetStateAction<AppLogEntry[]>>
  logPage?: number
  logPageSize?: number
  logTotal?: number
  loadLogs: (page?: number) => Promise<void> | void
  clearLogs: () => Promise<void> | void
}

