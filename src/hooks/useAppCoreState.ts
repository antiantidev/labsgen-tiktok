import { useState } from "react"
import type { Dispatch, SetStateAction } from "react"
import type { AppSettings, PageId, ThemeMode, UpdateProgress } from "../shared/domain/app"

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
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState("")
  const [loadProgress, setLoadProgress] = useState(0)
  const [isDriverMissing, setIsDriverMissing] = useState(false)

  const [currentPage, setCurrentPage] = useState<PageId>("home")
  const [theme, setTheme] = useState<ThemeMode>("dark")
  const [appVersion, setAppVersion] = useState("0.0.0")
  const [defaultPath, setDefaultPath] = useState("")
  const [systemPaths, setSystemPaths] = useState<Record<string, string>>({})

  const [settings, setSettings] = useState<AppSettings>({
    customProfilePath: "",
    autoRefresh: true,
    minimizeOnClose: false,
    captureDelay: 5000
  })

  const [updateProgress, setUpdateProgress] = useState<UpdateProgress | null>(null)

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
