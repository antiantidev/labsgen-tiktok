import type { Dispatch, SetStateAction } from "react"
import type { AppSettings, PageId, ThemeMode, UpdateProgress } from "../shared/domain/app"
import { useCoreStore } from "../stores"

type AppCoreState = {
  isLoading: boolean
  setIsLoading: Dispatch<SetStateAction<boolean>>
  loadingMessage: string
  setLoadingMessage: Dispatch<SetStateAction<string>>
  loadProgress: number
  setLoadProgress: Dispatch<SetStateAction<number>>
  isDriverMissing: boolean
  setIsDriverMissing: Dispatch<SetStateAction<boolean>>
  currentPage: PageId
  setCurrentPage: Dispatch<SetStateAction<PageId>>
  theme: ThemeMode
  setTheme: Dispatch<SetStateAction<ThemeMode>>
  appVersion: string
  setAppVersion: Dispatch<SetStateAction<string>>
  defaultPath: string
  setDefaultPath: Dispatch<SetStateAction<string>>
  systemPaths: Record<string, string>
  setSystemPaths: Dispatch<SetStateAction<Record<string, string>>>
  settings: AppSettings
  setSettings: Dispatch<SetStateAction<AppSettings>>
  updateProgress: UpdateProgress | null
  setUpdateProgress: Dispatch<SetStateAction<UpdateProgress | null>>
}

export const useAppCoreState = (): AppCoreState => {
  const isLoading = useCoreStore((state) => state.isLoading)
  const setIsLoading = useCoreStore((state) => state.setIsLoading)
  const loadingMessage = useCoreStore((state) => state.loadingMessage)
  const setLoadingMessage = useCoreStore((state) => state.setLoadingMessage)
  const loadProgress = useCoreStore((state) => state.loadProgress)
  const setLoadProgress = useCoreStore((state) => state.setLoadProgress)
  const isDriverMissing = useCoreStore((state) => state.isDriverMissing)
  const setIsDriverMissing = useCoreStore((state) => state.setIsDriverMissing)
  const currentPage = useCoreStore((state) => state.currentPage)
  const setCurrentPage = useCoreStore((state) => state.setCurrentPage)
  const theme = useCoreStore((state) => state.theme)
  const setTheme = useCoreStore((state) => state.setTheme)
  const appVersion = useCoreStore((state) => state.appVersion)
  const setAppVersion = useCoreStore((state) => state.setAppVersion)
  const defaultPath = useCoreStore((state) => state.defaultPath)
  const setDefaultPath = useCoreStore((state) => state.setDefaultPath)
  const systemPaths = useCoreStore((state) => state.systemPaths)
  const setSystemPaths = useCoreStore((state) => state.setSystemPaths)
  const settings = useCoreStore((state) => state.settings)
  const setSettings = useCoreStore((state) => state.setSettings)
  const updateProgress = useCoreStore((state) => state.updateProgress)
  const setUpdateProgress = useCoreStore((state) => state.setUpdateProgress)

  return {
    isLoading,
    setIsLoading,
    loadingMessage,
    setLoadingMessage,
    loadProgress,
    setLoadProgress,
    isDriverMissing,
    setIsDriverMissing,
    currentPage,
    setCurrentPage,
    theme,
    setTheme,
    appVersion,
    setAppVersion,
    defaultPath,
    setDefaultPath,
    systemPaths,
    setSystemPaths,
    settings,
    setSettings,
    updateProgress,
    setUpdateProgress
  }
}
