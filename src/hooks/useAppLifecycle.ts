import { useAppBootstrap } from "./useAppBootstrap"
import { useAppEventListeners } from "./useAppEventListeners"
import { useThemeClassSync } from "./useThemeClassSync"
import type { UseAppViewStateResult } from "./useAppViewState"

export const useAppLifecycle = ({
  intl,
  core,
  ui,
  logs,
  shell,
  ensureDriverReady,
  accounts,
  stream
}: UseAppViewStateResult): void => {
  const { t, i18n } = intl

  useThemeClassSync(core.theme)

  useAppBootstrap({
    t,
    i18n,
    loadLogs: logs.loadLogs,
    ensureDriverReady,
    refreshAccountInfo: accounts.refreshAccountInfo,
    token: accounts.token,
    activeAccountId: accounts.activeAccountId,
    setIsLoading: core.setIsLoading,
    setLoadProgress: core.setLoadProgress,
    setLoadingMessage: core.setLoadingMessage,
    setAppVersion: core.setAppVersion,
    setDefaultPath: core.setDefaultPath,
    setSystemPaths: core.setSystemPaths,
    setAccounts: accounts.setAccounts,
    setSettings: core.setSettings,
    setActiveAccountId: accounts.setActiveAccountId,
    setCurrentPage: core.setCurrentPage,
    setTheme: core.setTheme,
    setStreamTitle: stream.setStreamTitle,
    setGameCategory: stream.setGameCategory,
    setGameMaskId: stream.setGameMaskId,
    setMature: stream.setMature,
    setToken: accounts.setToken
  })

  useAppEventListeners({
    t,
    showModal: ui.showModal,
    pushToast: ui.pushToast,
    pushStatus: shell.pushStatus
  })
}
