import type { AccountRecord } from "../../../shared/ipc/contracts"
import type { StatusState } from "../../../shared/domain/app"

export type TokensRouteProps = {
  isDriverMissing: boolean
  loadLocalToken: () => Promise<void>
  loadWebToken: (existingAccountId?: string | null) => Promise<void>
  isWebLoading: boolean
  refreshAccountInfo: (manualToken?: string | null, accountId?: string | null) => Promise<boolean>
  activeAccountId: string | null
  status: StatusState
  accounts: AccountRecord[]
  selectAccount: (accountId: string) => void
  deleteAccount: (accountId: string) => Promise<void>
}

