import { useEffect } from "react"
import type { Dispatch, SetStateAction } from "react"
import type { i18n as I18nInstance } from "i18next"
import type { AccountRecord } from "../shared/ipc/contracts"
import type { AppSettings, PageId, ThemeMode } from "../shared/domain/app"
import { hydrateAppState } from "../shared/domain/appStatePersistence"
import { APP_SETTING_KEYS } from "../shared/domain/settings"
import { useApiBridge } from "./useApiBridge"

type UseAppBootstrapDeps = {
  t: (key: string) => string
  i18n: Pick<I18nInstance, "changeLanguage">
  loadLogs: (page?: number) => Promise<void>
  ensureDriverReady: () => Promise<{ ok: boolean }>
  refreshAccountInfo: (manualToken?: string | null, accountId?: string | null) => Promise<boolean>
  token: string
  activeAccountId: string | null
  setIsLoading: Dispatch<SetStateAction<boolean>>
  setLoadProgress: Dispatch<SetStateAction<number>>
  setLoadingMessage: Dispatch<SetStateAction<string>>
  setAppVersion: Dispatch<SetStateAction<string>>
  setDefaultPath: Dispatch<SetStateAction<string>>
  setSystemPaths: Dispatch<SetStateAction<Record<string, string>>>
  setAccounts: Dispatch<SetStateAction<AccountRecord[]>>
  setSettings: Dispatch<SetStateAction<AppSettings>>
  setActiveAccountId: Dispatch<SetStateAction<string | null>>
  setCurrentPage: Dispatch<SetStateAction<PageId>>
  setTheme: Dispatch<SetStateAction<ThemeMode>>
  setStreamTitle: Dispatch<SetStateAction<string>>
  setGameCategory: Dispatch<SetStateAction<string>>
  setGameMaskId: Dispatch<SetStateAction<string>>
  setMature: Dispatch<SetStateAction<boolean>>
  setToken: Dispatch<SetStateAction<string>>
}

export const useAppBootstrap = ({
  t,
  i18n,
  loadLogs,
  ensureDriverReady,
  refreshAccountInfo,
  token,
  activeAccountId,
  setIsLoading,
  setLoadProgress,
  setLoadingMessage,
  setAppVersion,
  setDefaultPath,
  setSystemPaths,
  setAccounts,
  setSettings,
  setActiveAccountId,
  setCurrentPage,
  setTheme,
  setStreamTitle,
  setGameCategory,
  setGameMaskId,
  setMature,
  setToken
}: UseAppBootstrapDeps): void => {
  const api = useApiBridge()
  useEffect(() => {
    let isDisposed = false
    let doneTimer: ReturnType<typeof setTimeout> | null = null

    const init = async () => {
      setIsLoading(true)
      setLoadProgress(5)
      setLoadingMessage(t("common.loading"))

      const version = await api.getAppVersion()
      const defPath = await api.getDefaultPath()
      const allPaths = await api.getAllPaths()
      if (isDisposed) return
      setAppVersion(version)
      setDefaultPath(defPath)
      setSystemPaths(allPaths)

      setLoadProgress(30)
      setLoadingMessage("Accessing local database...")
      const data = await api.getSetting(APP_SETTING_KEYS.APP_STATE)
      const persisted = hydrateAppState(data)

      await loadLogs(1)
      const dbAccounts = await api.getAccounts()
      if (isDisposed) return
      setAccounts(dbAccounts)
      if (persisted.settings) setSettings(persisted.settings)
      if (persisted.activeAccountId) setActiveAccountId(persisted.activeAccountId)
      if (persisted.lastPage) setCurrentPage(persisted.lastPage)
      if (persisted.theme) setTheme(persisted.theme)
      void i18n.changeLanguage(persisted.language)
      if (persisted.title) setStreamTitle(persisted.title)
      if (persisted.game) setGameCategory(persisted.game)
      if (persisted.gameMaskId) setGameMaskId(persisted.gameMaskId)
      if (persisted.mature !== undefined) setMature(persisted.mature)
      if (persisted.token) setToken(persisted.token)

      setLoadProgress(60)
      setLoadingMessage("Verifying system dependencies...")
      const driverStatus = await ensureDriverReady()
      if (!driverStatus.ok || isDisposed) return

      setLoadProgress(85)
      if (persisted.settings?.autoRefresh && (token || persisted.token)) {
        setLoadingMessage("Synchronizing account status...")
        await refreshAccountInfo(token || persisted.token, activeAccountId || persisted.activeAccountId || null)
      }
      if (isDisposed) return
      setLoadProgress(100)
      setLoadingMessage("Kernel ready.")
      api.rendererReady()
      doneTimer = setTimeout(() => setIsLoading(false), 800)
    }

    void init()
    return () => {
      isDisposed = true
      if (doneTimer) clearTimeout(doneTimer)
    }
    // Intentionally bootstrap once on initial mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
