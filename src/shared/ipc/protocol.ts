import { IPC_CHANNELS } from "./channels"
import type {
  DriverBootstrapResult,
  PerfResult,
  RefreshAccountResult,
  SearchGamesResult,
  StartStreamResult,
  StreamCategory,
  StreamStartPayload,
  SystemLogEntry,
  TokenLoadResult,
  UpdateAvailableInfo,
  UpdateProgressInfo
} from "./contracts"
import type { AccountRecord } from "../domain/app"

export type IpcInvokeMap = {
  [IPC_CHANNELS.SET_TOKEN]: { args: [token: string]; return: unknown }
  [IPC_CHANNELS.REFRESH_ACCOUNT]: { args: []; return: RefreshAccountResult }
  [IPC_CHANNELS.SEARCH_GAMES]: { args: [text: string]; return: SearchGamesResult }
  [IPC_CHANNELS.START_STREAM]: { args: [data: StreamStartPayload]; return: StartStreamResult }
  [IPC_CHANNELS.END_STREAM]: { args: []; return: { ok: boolean; error?: string } }
  [IPC_CHANNELS.SET_STREAM_ID]: { args: [id: string | null]; return: unknown }
  [IPC_CHANNELS.LOAD_LOCAL_TOKEN]: { args: []; return: TokenLoadResult }
  [IPC_CHANNELS.LOAD_WEB_TOKEN]: { args: [options?: { accountId?: string | null }]; return: TokenLoadResult }
  [IPC_CHANNELS.BOOTSTRAP_DRIVER]: { args: []; return: DriverBootstrapResult }
  [IPC_CHANNELS.CHECK_DRIVER_EXISTS]: { args: []; return: boolean }
  [IPC_CHANNELS.DELETE_PROFILE]: { args: [accountId: string]; return: boolean }

  [IPC_CHANNELS.SELECT_FOLDER]: { args: []; return: string | null }
  [IPC_CHANNELS.OPEN_PATH]: { args: [targetPath: string]; return: unknown }
  [IPC_CHANNELS.GET_DEFAULT_PATH]: { args: []; return: string }
  [IPC_CHANNELS.GET_ALL_PATHS]: { args: []; return: Record<string, string> }
  [IPC_CHANNELS.GET_PERFORMANCE]: { args: []; return: PerfResult }

  [IPC_CHANNELS.DB_GET_ACCOUNTS]: { args: []; return: AccountRecord[] }
  [IPC_CHANNELS.DB_SAVE_ACCOUNT]: { args: [account: AccountRecord]; return: unknown }
  [IPC_CHANNELS.DB_UPDATE_USERNAME]: { args: [payload: { id: string; username: string }]; return: unknown }
  [IPC_CHANNELS.DB_DELETE_ACCOUNT]: { args: [id: string]; return: unknown }
  [IPC_CHANNELS.DB_GET_SETTING]: { args: [key: string, defaultValue?: unknown]; return: unknown }
  [IPC_CHANNELS.DB_SAVE_SETTING]: { args: [key: string, value: unknown]; return: unknown }

  [IPC_CHANNELS.SYNC_CATEGORIES]: { args: []; return: { ok: boolean; count?: number; added?: number; error?: string } }
  [IPC_CHANNELS.GET_CATEGORY_COUNT]: { args: []; return: number }
  [IPC_CHANNELS.GET_CATEGORY_BY_NAME]: { args: [name: string]; return: StreamCategory | null }

  [IPC_CHANNELS.GET_APP_VERSION]: { args: []; return: string }
  [IPC_CHANNELS.CHECK_FOR_UPDATES]: { args: []; return: { ok: boolean; upToDate?: boolean; devMode?: boolean; error?: string } }

  [IPC_CHANNELS.SYSTEM_LOG_ADD]: { args: [entry: SystemLogEntry]; return: unknown }
  [IPC_CHANNELS.SYSTEM_LOG_GET]: { args: [params?: { limit?: number; offset?: number }]; return: SystemLogEntry[] }
  [IPC_CHANNELS.SYSTEM_LOG_COUNT]: { args: []; return: number }
  [IPC_CHANNELS.SYSTEM_LOG_CLEAR]: { args: []; return: unknown }
}

export type IpcSendMap = {
  [IPC_CHANNELS.WINDOW_MINIMIZE]: []
  [IPC_CHANNELS.WINDOW_MAXIMIZE]: []
  [IPC_CHANNELS.WINDOW_CLOSE]: []
  [IPC_CHANNELS.OPEN_EXTERNAL]: [url: string]
  [IPC_CHANNELS.RENDERER_READY]: []
  [IPC_CHANNELS.START_DOWNLOAD]: []
  [IPC_CHANNELS.QUIT_AND_INSTALL]: []
}

export type IpcMainToRendererEventMap = {
  [IPC_CHANNELS.TOKEN_STATUS]: string
  [IPC_CHANNELS.UPDATE_AVAILABLE]: UpdateAvailableInfo
  [IPC_CHANNELS.UPDATE_DOWNLOADED]: void
  [IPC_CHANNELS.UPDATE_ERROR]: string
  [IPC_CHANNELS.UPDATE_PROGRESS]: UpdateProgressInfo
  [IPC_CHANNELS.SYSTEM_LOG]: SystemLogEntry
}
