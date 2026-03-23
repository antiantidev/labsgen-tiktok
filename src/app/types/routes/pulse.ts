import type { Dispatch, SetStateAction } from "react"
import type { AppLogEntry } from "../logs"

export type PulseRouteProps = {
  statusLog: AppLogEntry[]
  setStatusLog: Dispatch<SetStateAction<AppLogEntry[]>>
  logPage: number
  logPageSize: number
  logTotal: number
  loadLogs: (page?: number) => Promise<void>
  clearLogs: () => Promise<void>
}

