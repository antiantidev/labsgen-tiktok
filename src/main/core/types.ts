import type { App, BrowserWindow } from "electron"
import type { StreamAccountInfo, StreamCategory, StreamStartResult, SystemLogEntry } from "../../shared/ipc/contracts"

export type AppWithQuitState = App & { isQuitting?: boolean }

export type StreamServiceLike = {
  setToken: (token: string) => unknown
  getInfo: () => Promise<StreamAccountInfo>
  search: (keyword: string) => Promise<StreamCategory[]>
  start: (title: string, category: string, audienceType: string) => Promise<StreamStartResult>
  end: () => Promise<boolean>
  setStreamId: (id: string | null) => unknown
}

export type TokenServiceLike = {
  loadLocalToken: () => { token: string | null; error?: string | null }
}

export type DriverServiceLike = {
  ensureDriver: (onProgress?: (status: string) => void) => Promise<{ alreadyExists?: boolean }>
  checkDriver: () => Promise<boolean>
  getExecutablePath: () => string
}

export type DBAccountRecord = {
  id: string
  name: string
  type: string
  token: string
  username?: string
  lastUsed?: number
}

export type DBServiceLike = {
  db: { prepare: (query: string) => { run: (...args: unknown[]) => unknown } }
  init: () => boolean
  getDbPath: () => string
  getSetting: <T = unknown>(key: string, defaultValue?: T) => T
  saveSetting: (key: string, value: unknown) => unknown
  getAllAccounts: () => DBAccountRecord[]
  saveAccount: (account: DBAccountRecord) => unknown
  deleteAccount: (id: string) => unknown
  clearCategories: () => unknown
  saveCategories: (categories: StreamCategory[]) => unknown
  getCategoryCount: () => number
  getCategoryByName: (name: string) => StreamCategory | null
  searchLocalCategories: (text: string) => StreamCategory[]
  addSystemLog: (level: string, message: string, timestamp: string) => { lastInsertRowid?: number | string }
  pruneSystemLogs: (keepCount: number) => unknown
  getSystemLogs: (limit: number, offset: number) => SystemLogEntry[]
  getSystemLogCount: () => number
  clearSystemLogs: () => unknown
}

export type EncryptionServiceLike = {
  encrypt: (text: string) => string
  decrypt: (text: string) => string
}

export type SeleniumTokenLike = {
  loadWebToken: (
    win: BrowserWindow | null,
    onStatus: (status: string) => void,
    opts: { profilePath: string; driverPath: string }
  ) => Promise<{ token: string | null; error?: string }>
}
