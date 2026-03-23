import { useAppLifecycle } from "./useAppLifecycle"
import { useAppViewState } from "./useAppViewState"
import { buildSidebarProps } from "./appOrchestratorBuilders"
import { buildRouteContentProps } from "./routeContentBuilder"
import type { AppOrchestratorViewModel } from "../app/types"

export const useAppOrchestrator = (): AppOrchestratorViewModel => {
  const viewState = useAppViewState()
  const { core, ui, logs, shell, accounts, stream, persistence } = viewState
  useAppLifecycle(viewState)

  const sidebarProps = buildSidebarProps({
    currentPage: core.currentPage,
    setCurrentPage: core.setCurrentPage,
    username: accounts.status.username,
    canGoLive: accounts.status.canGoLive,
    version: core.appVersion,
    isLoading: core.isLoading
  })

  const routeContentProps = buildRouteContentProps({
    currentPage: core.currentPage,
    setCurrentPage: core.setCurrentPage,
    isLoading: core.isLoading,
    status: accounts.status,
    streamData: stream.streamData,
    startStream: stream.startStream,
    endStream: stream.endStream,
    streamTitle: stream.streamTitle,
    gameCategory: stream.gameCategory,
    pushToast: ui.pushToast,
    setStreamTitle: stream.setStreamTitle,
    handleSearch: stream.handleSearch,
    suggestions: stream.suggestions,
    showSuggestions: stream.showSuggestions,
    setShowSuggestions: stream.setShowSuggestions,
    setGameCategory: stream.setGameCategory,
    setGameMaskId: stream.setGameMaskId,
    mature: stream.mature,
    setMature: stream.setMature,
    saveConfig: persistence.saveConfig,
    gameMaskId: stream.gameMaskId,
    isDriverMissing: core.isDriverMissing,
    loadLocalToken: accounts.loadLocalToken,
    loadWebToken: accounts.loadWebToken,
    isWebLoading: accounts.isWebLoading,
    refreshAccountInfo: accounts.refreshAccountInfo,
    activeAccountId: accounts.activeAccountId,
    accounts: accounts.accounts,
    selectAccount: accounts.selectAccount,
    deleteAccount: accounts.deleteAccount,
    statusLog: logs.statusLog,
    setStatusLog: logs.setStatusLog,
    logPage: logs.logPage,
    logPageSize: logs.logPageSize,
    logTotal: logs.logTotal,
    loadLogs: logs.loadLogs,
    clearLogs: logs.clearLogs,
    setIsDriverMissing: core.setIsDriverMissing,
    settings: core.settings,
    setSettings: core.setSettings,
    defaultPath: core.defaultPath,
    systemPaths: core.systemPaths,
    version: core.appVersion,
    showModal: ui.showModal,
    theme: core.theme,
    toggleTheme: shell.toggleTheme,
    updateProgress: core.updateProgress
  })

  return {
    isLoading: core.isLoading,
    loadingMessage: core.loadingMessage,
    loadProgress: core.loadProgress,
    toasts: ui.toasts,
    dismissToast: ui.dismissToast,
    sidebarProps,
    routeContentProps,
    modal: ui.modal,
    theme: core.theme,
    closeModal: ui.closeModal
  }
}
