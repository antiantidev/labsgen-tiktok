import type { LogLevel } from "../../shared/domain/app"

export type AppLogEntry = {
  id: string | number
  level: LogLevel
  message: string
  timestamp: string
  time: string
}

