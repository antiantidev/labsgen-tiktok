import { create } from "zustand"
import type { SetStateAction } from "react"
import type { ApiBridge, SystemLogEntry } from "../shared/ipc/contracts"
import type { AppLogEntry } from "../app/types"
import { normalizeLogLevel, resolveStateUpdate } from "./utils"

const LOG_PAGE_SIZE = 50

function toAppLogEntry(entry: SystemLogEntry): AppLogEntry {
  return {
    id: entry.id ?? Date.now(),
    level: normalizeLogLevel(entry.level),
    message: entry.message || "",
    timestamp: entry.timestamp || new Date().toISOString(),
    time: new Date(entry.timestamp || Date.now()).toLocaleTimeString()
  }
}

type LogsStore = {
  statusLog: AppLogEntry[]
  logPage: number
  logPageSize: number
  logTotal: number
  setStatusLog: (update: SetStateAction<AppLogEntry[]>) => void
  setLogTotal: (update: SetStateAction<number>) => void
  loadLogs: (api: ApiBridge, page?: number) => Promise<void>
  clearLogs: (api: ApiBridge) => Promise<void>
  appendSystemLog: (entry: SystemLogEntry) => void
}

export const useLogsStore = create<LogsStore>((set, get) => ({
  statusLog: [],
  logPage: 1,
  logPageSize: LOG_PAGE_SIZE,
  logTotal: 0,
  setStatusLog: (update) => set((state) => ({ statusLog: resolveStateUpdate(update, state.statusLog) })),
  setLogTotal: (update) => set((state) => ({ logTotal: resolveStateUpdate(update, state.logTotal) })),
  loadLogs: async (api, page = 1) => {
    const offset = (page - 1) * LOG_PAGE_SIZE
    const logs = await api.getSystemLogs({ limit: LOG_PAGE_SIZE, offset })
    const total = await api.getSystemLogCount()
    set({
      logTotal: total || 0,
      logPage: page,
      statusLog: (logs || []).map(toAppLogEntry)
    })
  },
  clearLogs: async (api) => {
    await api.clearSystemLogs()
    set({
      statusLog: [],
      logTotal: 0,
      logPage: 1
    })
  },
  appendSystemLog: (entry) => {
    if (!entry) return
    const nextLog = toAppLogEntry(entry)
    const state = get()
    const nextTotal = state.logTotal + 1
    if (state.logPage === 1) {
      set({
        logTotal: nextTotal,
        statusLog: [nextLog, ...state.statusLog].slice(0, state.logPageSize)
      })
      return
    }
    set({ logTotal: nextTotal })
  }
}))

