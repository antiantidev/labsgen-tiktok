import { useState } from "react"
import type { TFunction } from "i18next"
import type { SettingsPageProps } from "../../app/types"
import { useApiBridge } from "../useApiBridge"

type UseSettingsActionsDeps = Pick<
  SettingsPageProps,
  "version" | "showModal" | "setIsDriverMissing" | "pushToast" | "settings" | "setSettings"
> & {
  t: TFunction
}

type UseSettingsActionsResult = {
  checkingUpdate: boolean
  isInstallingDriver: boolean
  isUpToDate: boolean
  handleUpdateCheck: () => Promise<void>
  handleInstallDriver: () => Promise<void>
  handlePathChange: () => Promise<void>
}

export const useSettingsActions = ({
  t,
  version,
  showModal,
  setIsDriverMissing,
  pushToast,
  settings,
  setSettings
}: UseSettingsActionsDeps): UseSettingsActionsResult => {
  const api = useApiBridge()
  const [checkingUpdate, setCheckingUpdate] = useState(false)
  const [isInstallingDriver, setIsDriverInstalling] = useState(false)
  const [isUpToDate, setIsUpToDate] = useState(false)

  const handleUpdateCheck = async () => {
    setCheckingUpdate(true)
    const startedAt = Date.now()

    try {
      const res = await api.checkForUpdates()
      const elapsed = Date.now() - startedAt
      if (elapsed < 700) await new Promise((resolve) => setTimeout(resolve, 700 - elapsed))

      if (res.ok && res.upToDate) {
        setIsUpToDate(true)
        await showModal(t("common.up_to_date"), `${t("common.up_to_date_desc")} Labsgen Tiktok (v${version})`)
      } else {
        setIsUpToDate(false)
      }
    } finally {
      setCheckingUpdate(false)
    }
  }

  const handleInstallDriver = async () => {
    setIsDriverInstalling(true)
    try {
      const res = await api.bootstrapDriver()
      if (res.ok) {
        setIsDriverMissing(false)
        pushToast("ChromeDriver installed successfully", "success")
      } else {
        pushToast(res.error, "error")
      }
    } finally {
      setIsDriverInstalling(false)
    }
  }

  const handlePathChange = async () => {
    const path = await api.selectFolder()
    if (path) {
      setSettings({ ...settings, customProfilePath: path })
    }
  }

  return {
    checkingUpdate,
    isInstallingDriver,
    isUpToDate,
    handleUpdateCheck,
    handleInstallDriver,
    handlePathChange
  }
}
