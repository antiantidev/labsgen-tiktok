import type { AccountRecord, AppPersistedSettingsMap, LogLevel } from "../domain/app"
export type { AccountRecord } from "../domain/app"

export type IpcOk<T> = { ok: true } & T
export type IpcErr = { ok: false; error: string; code?: string | null }

export type DriverBootstrapResult = IpcOk<{ alreadyExists?: boolean }> | IpcErr
export type TokenLoadResult = { token: string | null; error?: string | null; code?: string | null }

export type StreamStartPayload = {
  title: string
  category: string
  audienceType: string
}

export type StreamStartResult = {
  streamUrl: string | null
  streamKey: string | null
  streamId: string | null
}

export type StreamCategory = {
  full_name: string
  game_mask_id: string
  short_name?: string
}

export type StreamAccountInfo = {
  user?: { username?: string }
  application_status?: { status?: string }
  can_be_live?: boolean
  categories?: StreamCategory[]
}

export type RefreshAccountResult = {
  ok: boolean
  info?: StreamAccountInfo
  error?: string
}

export type SearchGamesResult = {
  ok: boolean
  categories?: StreamCategory[]
}

export type StartStreamResult = {
  ok: boolean
  result?: StreamStartResult
  error?: string
}

export type UpdateAvailableInfo = {
  latest?: string
  current?: string
  releaseNotes?: unknown
}

export type UpdateProgressInfo = {
  percent?: number
  transferred?: number
  total?: number
  bytesPerSecond?: number
}

export type SystemLogEntry = {
  id?: number | string
  level: LogLevel
  message: string
  timestamp?: string
}

export type PerfResult = {
  ok: boolean
  cpuPercent: number
  memPercent: number
  memUsedMB: number
  memTotalMB: number
}

export interface ApiBridge {
  setToken(token: string): Promise<unknown>
  refreshAccount(): Promise<RefreshAccountResult>
  searchGames(text: string): Promise<SearchGamesResult>
  startStream(data: StreamStartPayload): Promise<StartStreamResult>
  endStream(): Promise<{ ok: boolean; error?: string }>
  setStreamId(id: string | null): Promise<unknown>
  loadLocalToken(): Promise<TokenLoadResult>
  loadWebToken(options?: { accountId?: string | null }): Promise<TokenLoadResult>

  windowMinimize(): void
  windowMaximize(): void
  windowClose(): void
  openExternal(url: string): void
  rendererReady(): void

  selectFolder(): Promise<string | null>
  openPath(targetPath: string): Promise<unknown>
  getDefaultPath(): Promise<string>
  getAllPaths(): Promise<Record<string, string>>
  checkDriverExists(): Promise<boolean>
  bootstrapDriver(): Promise<DriverBootstrapResult>
  deleteProfile(accountId: string): Promise<boolean>
  getPerformance(): Promise<PerfResult>

  getAccounts(): Promise<AccountRecord[]>
  saveAccount(acc: AccountRecord): Promise<unknown>
  updateUsername(id: string, username: string): Promise<unknown>
  deleteAccount(id: string): Promise<unknown>
  getSetting<K extends keyof AppPersistedSettingsMap>(key: K, defaultValue: AppPersistedSettingsMap[K]): Promise<AppPersistedSettingsMap[K]>
  getSetting<K extends keyof AppPersistedSettingsMap>(key: K, defaultValue?: AppPersistedSettingsMap[K]): Promise<AppPersistedSettingsMap[K] | null>
  getSetting<T = unknown>(key: string, defaultValue: T): Promise<T>
  getSetting<T = unknown>(key: string, defaultValue?: T): Promise<T | null>
  saveSetting<K extends keyof AppPersistedSettingsMap>(key: K, value: AppPersistedSettingsMap[K]): Promise<unknown>
  saveSetting(key: string, value: unknown): Promise<unknown>
  syncCategories(): Promise<{ ok: boolean; count?: number; added?: number; error?: string }>
  getCategoryCount(): Promise<number>
  getCategoryByName(name: string): Promise<StreamCategory | null>

  onTokenStatus(callback: (status: string) => void): () => void

  getAppVersion(): Promise<string>
  onUpdateAvailable(callback: (info: UpdateAvailableInfo) => void): () => void
  onUpdateDownloaded(callback: () => void): () => void
  onUpdateError(callback: (err: string) => void): () => void
  onUpdateProgress(callback: (info: UpdateProgressInfo) => void): () => void
  startDownload(): void
  quitAndInstall(): void
  checkForUpdates(): Promise<{ ok: boolean; upToDate?: boolean; devMode?: boolean; error?: string }>

  addSystemLog(entry: SystemLogEntry): Promise<unknown>
  getSystemLogs(params?: { limit?: number; offset?: number }): Promise<SystemLogEntry[]>
  getSystemLogCount(): Promise<number>
  clearSystemLogs(): Promise<unknown>
  onSystemLog(callback: (entry: SystemLogEntry) => void): () => void
}
