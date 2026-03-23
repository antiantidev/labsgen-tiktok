import { useCallback } from "react"
import type { Dispatch, SetStateAction } from "react"
import type { i18n as I18nInstance } from "i18next"
import type { AccountRecord } from "../shared/ipc/contracts"
import type { LogLevel, ModalButton, StatusState, ToastType } from "../shared/domain/app"
import { useApiBridge } from "./useApiBridge"
import { useAccountsStore } from "../stores"

type UseAccountsDeps = {
  t: (key: string) => string
  i18n: Pick<I18nInstance, "exists">
  pushStatus: (message: string, level?: LogLevel) => void
  pushToast: (message: string, type?: ToastType, duration?: number) => void
  showModal: (title: string, body: string, buttons?: ModalButton[]) => Promise<{ value: string }>
  ensureDriverReady: () => Promise<{ ok: boolean }>
  showChromeMissingModal: () => Promise<void>
  setIsDriverMissing: (missing: boolean) => void
}

type UseAccountsResult = {
  accounts: AccountRecord[]
  setAccounts: Dispatch<SetStateAction<AccountRecord[]>>
  activeAccountId: string | null
  setActiveAccountId: Dispatch<SetStateAction<string | null>>
  token: string
  setToken: Dispatch<SetStateAction<string>>
  isWebLoading: boolean
  status: StatusState
  refreshAccountInfo: (manualToken?: string | null, accountId?: string | null) => Promise<boolean>
  loadLocalToken: () => Promise<void>
  loadWebToken: (existingAccountId?: string | null) => Promise<void>
  deleteAccount: (accountId: string) => Promise<void>
  selectAccount: (accountId: string) => void
}

export const useAccounts = ({
  t,
  i18n,
  pushStatus,
  pushToast,
  showModal,
  ensureDriverReady,
  showChromeMissingModal,
  setIsDriverMissing
}: UseAccountsDeps): UseAccountsResult => {
  const api = useApiBridge()
  const accounts = useAccountsStore((state) => state.accounts)
  const setAccounts = useAccountsStore((state) => state.setAccounts)
  const activeAccountId = useAccountsStore((state) => state.activeAccountId)
  const setActiveAccountId = useAccountsStore((state) => state.setActiveAccountId)
  const token = useAccountsStore((state) => state.token)
  const setToken = useAccountsStore((state) => state.setToken)
  const isWebLoading = useAccountsStore((state) => state.isWebLoading)
  const status = useAccountsStore((state) => state.status)
  const refreshAccountInfoAction = useAccountsStore((state) => state.refreshAccountInfo)
  const loadLocalTokenAction = useAccountsStore((state) => state.loadLocalToken)
  const loadWebTokenAction = useAccountsStore((state) => state.loadWebToken)
  const deleteAccountAction = useAccountsStore((state) => state.deleteAccount)
  const selectAccountAction = useAccountsStore((state) => state.selectAccount)

  const refreshAccountInfo = useCallback(
    async (manualToken?: string | null, accountId?: string | null): Promise<boolean> => {
      return refreshAccountInfoAction({
        api,
        t,
        i18n,
        pushStatus,
        manualToken,
        accountId
      })
    },
    [api, i18n, pushStatus, refreshAccountInfoAction, t]
  )

  const loadLocalToken = useCallback(async (): Promise<void> => {
    await loadLocalTokenAction({
      api,
      t,
      i18n,
      pushStatus,
      pushToast
    })
  }, [api, i18n, loadLocalTokenAction, pushStatus, pushToast, t])

  const loadWebToken = useCallback(
    async (existingAccountId: string | null = null): Promise<void> => {
      await loadWebTokenAction({
        api,
        t,
        i18n,
        ensureDriverReady,
        showChromeMissingModal,
        setIsDriverMissing,
        pushStatus,
        pushToast,
        existingAccountId
      })
    },
    [
      api,
      ensureDriverReady,
      i18n,
      loadWebTokenAction,
      pushStatus,
      pushToast,
      setIsDriverMissing,
      showChromeMissingModal,
      t
    ]
  )

  const deleteAccount = useCallback(
    async (accountId: string): Promise<void> => {
      await deleteAccountAction({
        api,
        accountId,
        showModal,
        t,
        pushStatus,
        pushToast
      })
    },
    [api, deleteAccountAction, pushStatus, pushToast, showModal, t]
  )

  const selectAccount = useCallback(
    (accountId: string): void => {
      selectAccountAction({
        api,
        accountId,
        t,
        i18n,
        pushStatus,
        pushToast
      })
    },
    [api, i18n, pushStatus, pushToast, selectAccountAction, t]
  )

  return {
    accounts,
    setAccounts,
    activeAccountId,
    setActiveAccountId,
    token,
    setToken,
    isWebLoading,
    status,
    refreshAccountInfo,
    loadLocalToken,
    loadWebToken,
    deleteAccount,
    selectAccount
  }
}
