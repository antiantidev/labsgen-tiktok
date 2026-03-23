import { create } from "zustand"
import type { SetStateAction } from "react"
import type { i18n as I18nInstance } from "i18next"
import type { AccountRecord, ApiBridge } from "../shared/ipc/contracts"
import type { LogLevel, ModalButton, StatusState, ToastType } from "../shared/domain/app"
import { resolveStateUpdate } from "./utils"

const DEFAULT_STATUS: StatusState = {
  username: "Guest",
  appStatus: "tokens.unknown",
  canGoLive: false,
  badge: "common.check"
}

type RefreshAccountInfoParams = {
  api: ApiBridge
  t: (key: string) => string
  i18n: Pick<I18nInstance, "exists">
  pushStatus: (message: string, level?: LogLevel) => void
  manualToken?: string | null
  accountId?: string | null
}

type LoadLocalTokenParams = {
  api: ApiBridge
  t: (key: string) => string
  i18n: Pick<I18nInstance, "exists">
  pushStatus: (message: string, level?: LogLevel) => void
  pushToast: (message: string, type?: ToastType, duration?: number) => void
}

type LoadWebTokenParams = {
  api: ApiBridge
  t: (key: string) => string
  i18n: Pick<I18nInstance, "exists">
  ensureDriverReady: () => Promise<{ ok: boolean }>
  showChromeMissingModal: () => Promise<void>
  setIsDriverMissing: (missing: boolean) => void
  pushStatus: (message: string, level?: LogLevel) => void
  pushToast: (message: string, type?: ToastType, duration?: number) => void
  existingAccountId?: string | null
}

type DeleteAccountParams = {
  api: ApiBridge
  accountId: string
  showModal: (title: string, body: string, buttons?: ModalButton[]) => Promise<{ value: string }>
  t: (key: string) => string
  pushStatus: (message: string, level?: LogLevel) => void
  pushToast: (message: string, type?: ToastType, duration?: number) => void
}

type SelectAccountParams = {
  api: ApiBridge
  accountId: string
  t: (key: string) => string
  i18n: Pick<I18nInstance, "exists">
  pushStatus: (message: string, level?: LogLevel) => void
  pushToast: (message: string, type?: ToastType, duration?: number) => void
}

type AccountsStore = {
  accounts: AccountRecord[]
  activeAccountId: string | null
  token: string
  isWebLoading: boolean
  status: StatusState
  setAccounts: (update: SetStateAction<AccountRecord[]>) => void
  setActiveAccountId: (update: SetStateAction<string | null>) => void
  setToken: (update: SetStateAction<string>) => void
  setIsWebLoading: (update: SetStateAction<boolean>) => void
  setStatus: (update: SetStateAction<StatusState>) => void
  refreshAccountInfo: (params: RefreshAccountInfoParams) => Promise<boolean>
  loadLocalToken: (params: LoadLocalTokenParams) => Promise<void>
  loadWebToken: (params: LoadWebTokenParams) => Promise<void>
  deleteAccount: (params: DeleteAccountParams) => Promise<void>
  selectAccount: (params: SelectAccountParams) => void
}

export const useAccountsStore = create<AccountsStore>((set, get) => ({
  accounts: [],
  activeAccountId: null,
  token: "",
  isWebLoading: false,
  status: DEFAULT_STATUS,
  setAccounts: (update) => set((state) => ({ accounts: resolveStateUpdate(update, state.accounts) })),
  setActiveAccountId: (update) => set((state) => ({ activeAccountId: resolveStateUpdate(update, state.activeAccountId) })),
  setToken: (update) => set((state) => ({ token: resolveStateUpdate(update, state.token) })),
  setIsWebLoading: (update) => set((state) => ({ isWebLoading: resolveStateUpdate(update, state.isWebLoading) })),
  setStatus: (update) => set((state) => ({ status: resolveStateUpdate(update, state.status) })),

  refreshAccountInfo: async ({ api, t, i18n, pushStatus, manualToken, accountId }) => {
    const targetToken = manualToken || get().token
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

        set({
          status: {
            username: user?.username || t("tokens.unknown"),
            appStatus: appStatusKey,
            canGoLive: !!can_be_live,
            badge: can_be_live ? "common.ready" : "common.check"
          }
        })

        if (accountId && user?.username) {
          await api.updateUsername(accountId, user.username)
          const updatedList = await api.getAccounts()
          set({ accounts: updatedList })
        }
        return true
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      pushStatus(`Auth exception: ${message}`, "error")
    }
    return false
  },

  loadLocalToken: async ({ api, t, i18n, pushStatus, pushToast }) => {
    pushStatus("Local token extraction started", "info")
    const res = await api.loadLocalToken()
    if (res.token) {
      set({ token: res.token })
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
      set({ accounts: updatedList, activeAccountId: newId })
      await get().refreshAccountInfo({
        api,
        t,
        i18n,
        pushStatus,
        manualToken: res.token,
        accountId: newId
      })
      pushToast("Local token loaded", "success")
      pushStatus("Local token loaded", "success")
      return
    }

    if (res.error) {
      pushToast(res.error, "error")
      pushStatus(`Local token error: ${res.error}`, "error")
    }
  },

  loadWebToken: async ({
    api,
    t,
    i18n,
    ensureDriverReady,
    showChromeMissingModal,
    setIsDriverMissing,
    pushStatus,
    pushToast,
    existingAccountId = null
  }) => {
    pushStatus("Web token capture started", "info")
    const driverStatus = await ensureDriverReady()
    if (!driverStatus.ok) return

    set({ isWebLoading: true })
    const res = await api.loadWebToken({ accountId: existingAccountId })
    set({ isWebLoading: false })

    if (!res.token && res.code === "CHROME_NOT_FOUND") {
      await showChromeMissingModal()
      setIsDriverMissing(true)
      return
    }

    if (res.token) {
      set({ token: res.token })
      let finalId = existingAccountId
      if (!existingAccountId) {
        finalId = `profile_${Date.now()}`
        const webCount = get().accounts.filter((account) => account.type === "web").length
        const newAccount: AccountRecord = {
          id: finalId,
          name: `${t("tokens.web_capture")} ${webCount + 1}`,
          type: "web",
          token: res.token,
          username: "Authenticating...",
          lastUsed: Date.now()
        }
        await api.saveAccount(newAccount)
      } else {
        const currentAccounts = await api.getAccounts()
        const currentAccount = currentAccounts.find((item) => item.id === existingAccountId)
        if (currentAccount) {
          await api.saveAccount({ ...currentAccount, token: res.token, lastUsed: Date.now() })
        }
      }

      const updatedList = await api.getAccounts()
      set({
        accounts: updatedList,
        activeAccountId: finalId
      })
      await get().refreshAccountInfo({
        api,
        t,
        i18n,
        pushStatus,
        manualToken: res.token,
        accountId: finalId
      })
      pushToast("Authentication successful", "success")
      pushStatus("Web token captured", "success")
      return
    }

    if (res.error) {
      pushToast(res.error, "error")
      pushStatus(`Web token error: ${res.error}`, "error")
    }
  },

  deleteAccount: async ({ api, accountId, showModal, t, pushStatus, pushToast }) => {
    const confirmed = await showModal("Delete Account", "Are you sure?", [
      { label: t("common.cancel"), value: "cancel", primary: false },
      { label: "Delete", value: "delete", primary: true }
    ])

    if (confirmed.value !== "delete") return

    await api.deleteProfile(accountId)
    await api.deleteAccount(accountId)
    const updatedList = await api.getAccounts()
    set({ accounts: updatedList })

    if (get().activeAccountId === accountId) {
      set({
        token: "",
        activeAccountId: null,
        status: DEFAULT_STATUS
      })
    }

    pushToast("Account removed", "info")
    pushStatus(`Account removed: ${accountId}`, "info")
  },

  selectAccount: ({ api, accountId, t, i18n, pushStatus, pushToast }) => {
    const current = get().accounts.find((item) => item.id === accountId)
    if (!current) return

    set({
      activeAccountId: accountId,
      token: current.token
    })

    void get().refreshAccountInfo({
      api,
      t,
      i18n,
      pushStatus,
      manualToken: current.token,
      accountId
    })
    pushToast(`Switched to ${current.username || current.name}`, "success")
    pushStatus(`Switched account: ${current.username || current.name}`, "info")
  }
}))
