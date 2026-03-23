import { useCallback, useState } from "react"
import type { Dispatch, SetStateAction } from "react"
import type { i18n as I18nInstance } from "i18next"
import type { AccountRecord } from "../shared/ipc/contracts"
import type { LogLevel, ModalButton, StatusState, ToastType } from "../shared/domain/app"
import { useApiBridge } from "./useApiBridge"

const DEFAULT_STATUS: StatusState = {
  username: "Guest",
  appStatus: "tokens.unknown",
  canGoLive: false,
  badge: "common.check"
}

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
  const [accounts, setAccounts] = useState<AccountRecord[]>([])
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null)
  const [token, setToken] = useState("")
  const [isWebLoading, setIsWebLoading] = useState(false)
  const [status, setStatus] = useState<StatusState>(DEFAULT_STATUS)

  const refreshAccountInfo = useCallback(
    async (manualToken?: string | null, accountId?: string | null): Promise<boolean> => {
      const targetToken = manualToken || token
      if (!targetToken) return false

      pushStatus("Refreshing account data...", "info")
      await api.setToken(targetToken)
      try {
        const res = await api.refreshAccount()
        if (res.ok) {
          const { user, application_status, can_be_live } = res.info || {}
          const statusMap: Record<string, string> = {
            approved: "common.approved",
            pending: "common.pending",
            rejected: "common.rejected",
            not_applied: "common.not_applied",
            restricted: "common.restricted_status",
            forbidden: "common.restricted_status"
          }
          let appStatusKey = statusMap[application_status?.status || ""] || application_status?.status
          if (!appStatusKey || !i18n.exists(appStatusKey)) appStatusKey = "tokens.unknown"

          setStatus({
            username: user?.username || t("tokens.unknown"),
            appStatus: appStatusKey,
            canGoLive: !!can_be_live,
            badge: can_be_live ? "common.ready" : "common.check"
          })

          if (accountId && user?.username) {
            await api.updateUsername(accountId, user.username)
            const updatedList = await api.getAccounts()
            setAccounts(updatedList)
          }
          return true
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        pushStatus(`Auth exception: ${message}`, "error")
      }
      return false
    },
    [i18n, pushStatus, t, token]
  )

  const loadLocalToken = useCallback(async (): Promise<void> => {
    pushStatus("Local token extraction started", "info")
    const res = await api.loadLocalToken()
    if (res.token) {
      setToken(res.token)
      const newId = `local_${Date.now()}`
      const newAccount: AccountRecord = {
        id: newId,
        name: `${t("tokens.local_fetch")} (${new Date().toLocaleDateString()})`,
        type: "local",
        token: res.token,
        username: "Checking...",
        lastUsed: Date.now()
      }
      await api.saveAccount(newAccount)
      const updatedList = await api.getAccounts()
      setAccounts(updatedList)
      setActiveAccountId(newId)
      await refreshAccountInfo(res.token, newId)
      pushToast("Local token loaded", "success")
      pushStatus("Local token loaded", "success")
    } else if (res.error) {
      pushToast(res.error, "error")
      pushStatus(`Local token error: ${res.error}`, "error")
    }
  }, [pushStatus, pushToast, refreshAccountInfo, t])

  const loadWebToken = useCallback(
    async (existingAccountId: string | null = null): Promise<void> => {
      pushStatus("Web token capture started", "info")
      const driverStatus = await ensureDriverReady()
      if (!driverStatus.ok) return

      setIsWebLoading(true)
      const res = await api.loadWebToken({ accountId: existingAccountId })
      setIsWebLoading(false)

      if (!res.token && res.code === "CHROME_NOT_FOUND") {
        await showChromeMissingModal()
        setIsDriverMissing(true)
        return
      }

      if (res.token) {
        setToken(res.token)
        let finalId = existingAccountId
        if (!existingAccountId) {
          finalId = `profile_${Date.now()}`
          const newAccount: AccountRecord = {
            id: finalId,
            name: `${t("tokens.web_capture")} ${accounts.filter((acc) => acc.type === "web").length + 1}`,
            type: "web",
            token: res.token,
            username: "Authenticating...",
            lastUsed: Date.now()
          }
          await api.saveAccount(newAccount)
        } else {
          const currentAccounts = await api.getAccounts()
          const acc = currentAccounts.find((item) => item.id === existingAccountId)
          if (acc) {
            await api.saveAccount({ ...acc, token: res.token, lastUsed: Date.now() })
          }
        }
        const updatedList = await api.getAccounts()
        setAccounts(updatedList)
        setActiveAccountId(finalId)
        await refreshAccountInfo(res.token, finalId)
        pushToast("Authentication successful", "success")
        pushStatus("Web token captured", "success")
      } else if (res.error) {
        pushToast(res.error, "error")
        pushStatus(`Web token error: ${res.error}`, "error")
      }
    },
    [
      accounts,
      ensureDriverReady,
      pushStatus,
      pushToast,
      refreshAccountInfo,
      setIsDriverMissing,
      showChromeMissingModal,
      t
    ]
  )

  const deleteAccount = useCallback(
    async (accountId: string): Promise<void> => {
      const confirmed = await showModal("Delete Account", "Are you sure?", [
        { label: t("common.cancel"), value: "cancel", primary: false },
        { label: "Delete", value: "delete", primary: true }
      ])
      if (confirmed.value === "delete") {
        await api.deleteProfile(accountId)
        await api.deleteAccount(accountId)
        const updatedList = await api.getAccounts()
        setAccounts(updatedList)
        if (activeAccountId === accountId) {
          setToken("")
          setActiveAccountId(null)
          setStatus(DEFAULT_STATUS)
        }
        pushToast("Account removed", "info")
        pushStatus(`Account removed: ${accountId}`, "info")
      }
    },
    [activeAccountId, pushStatus, pushToast, showModal, t]
  )

  const selectAccount = useCallback(
    (accountId: string): void => {
      const acc = accounts.find((item) => item.id === accountId)
      if (acc) {
        setActiveAccountId(accountId)
        setToken(acc.token)
        void refreshAccountInfo(acc.token, accountId)
        pushToast(`Switched to ${acc.username || acc.name}`, "success")
        pushStatus(`Switched account: ${acc.username || acc.name}`, "info")
      }
    },
    [accounts, pushStatus, pushToast, refreshAccountInfo]
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
