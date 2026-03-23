export type PageId = "home" | "console" | "setup" | "tokens" | "status" | "settings"
export type ThemeMode = "dark" | "light"
export type ToastType = "info" | "success" | "warn" | "error"
export type LogLevel = "info" | "success" | "warn" | "error"

export type AccountRecord = {
  id: string
  name: string
  type: string
  token: string
  username?: string
  lastUsed?: number
}

export type AppSettings = {
  customProfilePath: string
  autoRefresh: boolean
  minimizeOnClose: boolean
  captureDelay: number
}

export type AppState = {
  title?: string
  game?: string
  audience_type?: string
  token?: string
  stream_id?: string | null
  theme?: ThemeMode
  language?: string
  activeAccountId?: string | null
  settings?: AppSettings
  lastPage?: PageId
  game_mask_id?: string
}

export type AppPersistedSettingsMap = {
  app_state: AppState
}

export type StatusState = {
  username: string
  appStatus: string
  canGoLive: boolean
  badge: string
}

export type StreamDataState = {
  url: string
  key: string
  id: string | null
  isLive: boolean
}

export type UpdateProgress = {
  percent: number
}

export type ModalButton = {
  label: string
  value: string
  primary?: boolean
}
