import type { Dispatch, SetStateAction } from "react"
import type { AppRouteContentProps, AppLogEntry } from "../app/types"
import type { AccountRecord, StreamCategory } from "../shared/ipc/contracts"
import type {
  AppSettings,
  ModalButton,
  PageId,
  StatusState,
  StreamDataState,
  ThemeMode,
  UpdateProgress
} from "../shared/domain/app"

type BuildRouteContentPropsInput = {
  currentPage: PageId
  setCurrentPage: Dispatch<SetStateAction<PageId>>
  isLoading: boolean
  status: StatusState
  streamData: StreamDataState
  startStream: () => Promise<void>
  endStream: () => Promise<void>
  streamTitle: string
  gameCategory: string
  pushToast: (message: string, type?: string, duration?: number) => void
  setStreamTitle: Dispatch<SetStateAction<string>>
  handleSearch: (text: string) => void
  suggestions: StreamCategory[]
  showSuggestions: boolean
  setShowSuggestions: Dispatch<SetStateAction<boolean>>
  setGameCategory: Dispatch<SetStateAction<string>>
  setGameMaskId: Dispatch<SetStateAction<string>>
  mature: boolean
  setMature: Dispatch<SetStateAction<boolean>>
  saveConfig: (showMessage?: boolean) => Promise<boolean>
  gameMaskId: string
  isDriverMissing: boolean
  loadLocalToken: () => Promise<void>
  loadWebToken: (existingAccountId?: string | null) => Promise<void>
  isWebLoading: boolean
  refreshAccountInfo: (manualToken?: string | null, accountId?: string | null) => Promise<boolean>
  activeAccountId: string | null
  accounts: AccountRecord[]
  selectAccount: (accountId: string) => void
  deleteAccount: (accountId: string) => Promise<void>
  statusLog: AppLogEntry[]
  setStatusLog: Dispatch<SetStateAction<AppLogEntry[]>>
  logPage: number
  logPageSize: number
  logTotal: number
  loadLogs: (page?: number) => Promise<void>
  clearLogs: () => Promise<void>
  setIsDriverMissing: Dispatch<SetStateAction<boolean>>
  settings: AppSettings
  setSettings: Dispatch<SetStateAction<AppSettings>>
  defaultPath: string
  systemPaths: Record<string, string>
  version: string
  showModal: (title: string, body: string, buttons?: ModalButton[]) => Promise<{ value: string }>
  theme: ThemeMode
  toggleTheme: () => void
  updateProgress: UpdateProgress | null
}

const buildCommonRouteProps = (input: BuildRouteContentPropsInput): AppRouteContentProps["common"] => ({
  currentPage: input.currentPage,
  setCurrentPage: input.setCurrentPage,
  isLoading: input.isLoading
})

const buildDashboardRouteProps = (
  input: BuildRouteContentPropsInput
): AppRouteContentProps["dashboard"] => ({
  status: input.status,
  streamData: input.streamData
})

const buildConsoleRouteProps = (input: BuildRouteContentPropsInput): AppRouteContentProps["consolePage"] => ({
  streamData: input.streamData,
  startStream: input.startStream,
  endStream: input.endStream,
  canGoLive: input.status.canGoLive,
  streamTitle: input.streamTitle,
  gameCategory: input.gameCategory,
  pushToast: input.pushToast
})

const buildSetupRouteProps = (input: BuildRouteContentPropsInput): AppRouteContentProps["setupPage"] => ({
  streamTitle: input.streamTitle,
  setStreamTitle: input.setStreamTitle,
  gameCategory: input.gameCategory,
  handleSearch: input.handleSearch,
  suggestions: input.suggestions,
  showSuggestions: input.showSuggestions,
  setShowSuggestions: input.setShowSuggestions,
  setGameCategory: input.setGameCategory,
  setGameMaskId: input.setGameMaskId,
  mature: input.mature,
  setMature: input.setMature,
  saveConfig: input.saveConfig,
  gameMaskId: input.gameMaskId,
  pushToast: input.pushToast
})

const buildTokensRouteProps = (input: BuildRouteContentPropsInput): AppRouteContentProps["tokensPage"] => ({
  isDriverMissing: input.isDriverMissing,
  loadLocalToken: input.loadLocalToken,
  loadWebToken: input.loadWebToken,
  isWebLoading: input.isWebLoading,
  refreshAccountInfo: input.refreshAccountInfo,
  activeAccountId: input.activeAccountId,
  status: input.status,
  accounts: input.accounts,
  selectAccount: input.selectAccount,
  deleteAccount: input.deleteAccount
})

const buildPulseRouteProps = (input: BuildRouteContentPropsInput): AppRouteContentProps["pulsePage"] => ({
  statusLog: input.statusLog,
  setStatusLog: input.setStatusLog,
  logPage: input.logPage,
  logPageSize: input.logPageSize,
  logTotal: input.logTotal,
  loadLogs: input.loadLogs,
  clearLogs: input.clearLogs
})

const buildSettingsRouteProps = (
  input: BuildRouteContentPropsInput
): AppRouteContentProps["settingsPage"] => ({
  setIsDriverMissing: input.setIsDriverMissing,
  isDriverMissing: input.isDriverMissing,
  settings: input.settings,
  setSettings: input.setSettings,
  saveConfig: input.saveConfig,
  defaultPath: input.defaultPath,
  systemPaths: input.systemPaths,
  version: input.version,
  showModal: input.showModal,
  theme: input.theme,
  toggleTheme: input.toggleTheme,
  pushToast: input.pushToast,
  updateProgress: input.updateProgress
})

export const buildRouteContentProps = (input: BuildRouteContentPropsInput): AppRouteContentProps => ({
  common: buildCommonRouteProps(input),
  dashboard: buildDashboardRouteProps(input),
  consolePage: buildConsoleRouteProps(input),
  setupPage: buildSetupRouteProps(input),
  tokensPage: buildTokensRouteProps(input),
  pulsePage: buildPulseRouteProps(input),
  settingsPage: buildSettingsRouteProps(input)
})
