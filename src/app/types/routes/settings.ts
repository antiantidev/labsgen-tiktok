import type { Dispatch, SetStateAction } from "react"
import type { AppSettings, ModalButton, ThemeMode, UpdateProgress } from "../../../shared/domain/app"

export type SettingsRouteProps = {
  setIsDriverMissing: Dispatch<SetStateAction<boolean>>
  isDriverMissing: boolean
  settings: AppSettings
  setSettings: Dispatch<SetStateAction<AppSettings>>
  saveConfig: (showMessage?: boolean) => Promise<boolean>
  defaultPath: string
  systemPaths: Record<string, string>
  version: string
  showModal: (title: string, body: string, buttons?: ModalButton[]) => Promise<{ value: string }>
  theme: ThemeMode
  toggleTheme: () => void
  pushToast: (message: string, type?: string, duration?: number) => void
  updateProgress: UpdateProgress | null
}

