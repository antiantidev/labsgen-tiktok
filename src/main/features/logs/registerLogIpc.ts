import type { IpcMain } from "electron"
import { IPC_CHANNELS } from "../../../shared/ipc/channels"
import { handleIpc } from "../../core/ipc/mainIpc"
import type { SystemLogEntry } from "../../../shared/ipc/contracts"

type RegisterLogIpcDeps = {
  ipcMain: IpcMain
  addSystemLog: (level: string, message: string) => unknown
  dbService: {
    getSystemLogs: (limit: number, offset: number) => unknown[]
    getSystemLogCount: () => number
    clearSystemLogs: () => unknown
  }
}

export function registerLogIpc({ ipcMain, addSystemLog, dbService }: RegisterLogIpcDeps): void {
  handleIpc(ipcMain, IPC_CHANNELS.SYSTEM_LOG_ADD, (_event, payload: SystemLogEntry) => addSystemLog(payload.level, payload.message))
  handleIpc(ipcMain, IPC_CHANNELS.SYSTEM_LOG_GET, (_event, params: { limit?: number; offset?: number } = {}) => {
    const limit = params.limit ?? 100
    const offset = params.offset ?? 0
    return dbService.getSystemLogs(limit, offset) as SystemLogEntry[]
  })
  handleIpc(ipcMain, IPC_CHANNELS.SYSTEM_LOG_COUNT, () => dbService.getSystemLogCount())
  handleIpc(ipcMain, IPC_CHANNELS.SYSTEM_LOG_CLEAR, () => dbService.clearSystemLogs())
}
