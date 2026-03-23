import { create } from "zustand"
import type { SetStateAction } from "react"
import type { AppSettings, PageId, ThemeMode, UpdateProgress } from "../shared/domain/app"
import { resolveStateUpdate } from "./utils"

type CoreStore = {
  isLoading: boolean
  loadingMessage: string
  loadProgress: number
  isDriverMissing: boolean
  currentPage: PageId
  theme: ThemeMode
  appVersion: string
  defaultPath: string
  systemPaths: Record<string, string>
  settings: AppSettings
  updateProgress: UpdateProgress | null
  setIsLoading: (update: SetStateAction<boolean>) => void
  setLoadingMessage: (update: SetStateAction<string>) => void
  setLoadProgress: (update: SetStateAction<number>) => void
  setIsDriverMissing: (update: SetStateAction<boolean>) => void
  setCurrentPage: (update: SetStateAction<PageId>) => void
  setTheme: (update: SetStateAction<ThemeMode>) => void
  setAppVersion: (update: SetStateAction<string>) => void
  setDefaultPath: (update: SetStateAction<string>) => void
  setSystemPaths: (update: SetStateAction<Record<string, string>>) => void
  setSettings: (update: SetStateAction<AppSettings>) => void
  setUpdateProgress: (update: SetStateAction<UpdateProgress | null>) => void
}

const DEFAULT_SETTINGS: AppSettings = {
  customProfilePath: "",
  autoRefresh: true,
  minimizeOnClose: false,
  captureDelay: 5000
}

export const useCoreStore = create<CoreStore>((set) => ({
  isLoading: true,
  loadingMessage: "",
  loadProgress: 0,
  isDriverMissing: false,
  currentPage: "home",
  theme: "dark",
  appVersion: "0.0.0",
  defaultPath: "",
  systemPaths: {},
  settings: DEFAULT_SETTINGS,
  updateProgress: null,
  setIsLoading: (update) => set((state) => ({ isLoading: resolveStateUpdate(update, state.isLoading) })),
  setLoadingMessage: (update) => set((state) => ({ loadingMessage: resolveStateUpdate(update, state.loadingMessage) })),
  setLoadProgress: (update) => set((state) => ({ loadProgress: resolveStateUpdate(update, state.loadProgress) })),
  setIsDriverMissing: (update) => set((state) => ({ isDriverMissing: resolveStateUpdate(update, state.isDriverMissing) })),
  setCurrentPage: (update) => set((state) => ({ currentPage: resolveStateUpdate(update, state.currentPage) })),
  setTheme: (update) => set((state) => ({ theme: resolveStateUpdate(update, state.theme) })),
  setAppVersion: (update) => set((state) => ({ appVersion: resolveStateUpdate(update, state.appVersion) })),
  setDefaultPath: (update) => set((state) => ({ defaultPath: resolveStateUpdate(update, state.defaultPath) })),
  setSystemPaths: (update) => set((state) => ({ systemPaths: resolveStateUpdate(update, state.systemPaths) })),
  setSettings: (update) => set((state) => ({ settings: resolveStateUpdate(update, state.settings) })),
  setUpdateProgress: (update) => set((state) => ({ updateProgress: resolveStateUpdate(update, state.updateProgress) }))
}))

