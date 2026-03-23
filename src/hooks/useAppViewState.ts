import { useTranslation } from "react-i18next"
import type { i18n as I18nInstance } from "i18next"
import { useAccounts } from "./useAccounts"
import { useAppCoreState } from "./useAppCoreState"
import { useAppPersistence } from "./useAppPersistence"
import { useAppShellControls } from "./useAppShellControls"
import { useDriverReadiness } from "./useDriverReadiness"
import { useStreamSetup } from "./useStreamSetup"
import { useSystemLogs } from "./useSystemLogs"
import { useUiFeedback } from "./useUiFeedback"

type I18nBridge = Pick<I18nInstance, "changeLanguage" | "exists" | "language">

export type UseAppViewStateResult = {
  intl: {
    t: (key: string) => string
    i18n: I18nBridge
  }
  core: ReturnType<typeof useAppCoreState>
  ui: ReturnType<typeof useUiFeedback>
  logs: ReturnType<typeof useSystemLogs>
  shell: ReturnType<typeof useAppShellControls>
  ensureDriverReady: ReturnType<typeof useDriverReadiness>
  accounts: ReturnType<typeof useAccounts>
  stream: ReturnType<typeof useStreamSetup>
  persistence: ReturnType<typeof useAppPersistence>
}

export const useAppViewState = (): UseAppViewStateResult => {
  const { t, i18n } = useTranslation()

  const core = useAppCoreState()
  const ui = useUiFeedback()
  const logs = useSystemLogs()
  const shell = useAppShellControls({
    t,
    setTheme: core.setTheme,
    showModal: ui.showModal
  })

  const ensureDriverReady = useDriverReadiness({
    t,
    showModal: ui.showModal,
    showChromeMissingModal: shell.showChromeMissingModal,
    pushToast: ui.pushToast,
    setIsLoading: core.setIsLoading,
    setLoadingMessage: core.setLoadingMessage,
    setIsDriverMissing: core.setIsDriverMissing
  })

  const accounts = useAccounts({
    t,
    i18n,
    pushStatus: shell.pushStatus,
    pushToast: ui.pushToast,
    showModal: ui.showModal,
    ensureDriverReady,
    showChromeMissingModal: shell.showChromeMissingModal,
    setIsDriverMissing: core.setIsDriverMissing
  })

  const stream = useStreamSetup({
    t,
    token: accounts.token,
    pushToast: ui.pushToast
  })

  const persistence = useAppPersistence({
    t,
    language: i18n.language,
    isLoading: core.isLoading,
    currentPage: core.currentPage,
    streamTitle: stream.streamTitle,
    gameCategory: stream.gameCategory,
    gameMaskId: stream.gameMaskId,
    mature: stream.mature,
    token: accounts.token,
    streamId: stream.streamData.id,
    theme: core.theme,
    activeAccountId: accounts.activeAccountId,
    settings: core.settings,
    pushToast: ui.pushToast,
    setGameCategory: stream.setGameCategory,
    setGameMaskId: stream.setGameMaskId
  })

  return {
    intl: {
      t,
      i18n
    },
    core,
    ui,
    logs,
    shell,
    ensureDriverReady,
    accounts,
    stream,
    persistence
  }
}
