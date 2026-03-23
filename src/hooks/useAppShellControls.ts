import { useCallback } from "react"
import type { Dispatch, SetStateAction } from "react"
import type { LogLevel, ModalButton, ThemeMode } from "../shared/domain/app"
import { CHROME_DOWNLOAD_URL } from "../shared/constants/externalLinks"
import { useApiBridge } from "./useApiBridge"

type UseAppShellControlsDeps = {
  t: (key: string) => string
  setTheme: Dispatch<SetStateAction<ThemeMode>>
  showModal: (title: string, body: string, buttons?: ModalButton[]) => Promise<{ value: string }>
}

type UseAppShellControlsResult = {
  toggleTheme: () => void
  pushStatus: (message: string, level?: LogLevel) => void
  showChromeMissingModal: () => Promise<void>
}

export const useAppShellControls = ({
  t,
  setTheme,
  showModal
}: UseAppShellControlsDeps): UseAppShellControlsResult => {
  const api = useApiBridge()
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"))
  }, [setTheme])

  const pushStatus = useCallback((message: string, level: LogLevel = "info") => {
    void api.addSystemLog({ level, message })
  }, [])

  const showChromeMissingModal = useCallback(async () => {
    const choice = await showModal(t("driver.chrome_missing_title"), t("driver.chrome_missing_desc"), [
      { label: t("common.cancel"), value: "cancel", primary: false },
      { label: t("driver.chrome_download"), value: "download", primary: true }
    ])

    if (choice.value === "download") {
      api.openExternal(CHROME_DOWNLOAD_URL)
    }
  }, [showModal, t])

  return {
    toggleTheme,
    pushStatus,
    showChromeMissingModal
  }
}
