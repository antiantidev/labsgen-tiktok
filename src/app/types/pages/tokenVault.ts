import type { AccountRecord } from "../../../shared/ipc/contracts"
import type { PageId, StatusState } from "../../../shared/domain/app"

export type TokenVaultPageProps = {
  loadLocalToken: () => void | Promise<void>
  loadWebToken: (existingAccountId?: string | null) => void | Promise<void>
  isWebLoading: boolean
  refreshAccountInfo: () => void | Promise<void>
  canGoLive: boolean
  status: StatusState
  accounts?: AccountRecord[]
  selectAccount: (accountId: string) => void
  deleteAccount: (accountId: string) => void | Promise<void>
  activeAccountId: string | null
  isLoading: boolean
  isDriverMissing: boolean
  setCurrentPage: (page: PageId) => void
}

