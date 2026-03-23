import type { Dispatch, SetStateAction } from "react"
import type { AppSettings, ModalButton, ThemeMode, UpdateProgress } from "../../../shared/domain/app"

export type SettingsPageProps = {
  isDriverMissing: boolean
  setIsDriverMissing: Dispatch<SetStateAction<boolean>>
  settings: AppSettings
  setSettings: Dispatch<SetStateAction<AppSettings>>
  saveConfig: (showMessage?: boolean) => Promise<boolean>
  defaultPath: string
  systemPaths: Record<string, string>
  version: string
  showModal: (title: string, body: string, buttons?: ModalButton[]) => Promise<{ value: string }>
  theme: ThemeMode
  toggleTheme: () => void
  pushToast: (message: string, type?: string) => void
  updateProgress: UpdateProgress | null
}

