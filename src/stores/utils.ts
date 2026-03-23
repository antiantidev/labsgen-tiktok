import type { SetStateAction } from "react"
import type { LogLevel } from "../shared/domain/app"

export function resolveStateUpdate<T>(update: SetStateAction<T>, current: T): T {
  return typeof update === "function" ? (update as (prev: T) => T)(current) : update
}

export function normalizeLogLevel(level?: string): LogLevel {
  if (level === "error" || level === "warn" || level === "success") return level
  return "info"
}

