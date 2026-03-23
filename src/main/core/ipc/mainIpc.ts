import type { IpcMain, IpcMainEvent, IpcMainInvokeEvent } from "electron"
import type { IpcInvokeMap, IpcSendMap } from "../../../shared/ipc/protocol"

type InvokeChannel = keyof IpcInvokeMap
type SendChannel = keyof IpcSendMap

export function handleIpc<C extends InvokeChannel>(
  ipcMain: IpcMain,
  channel: C,
  handler: (event: IpcMainInvokeEvent, ...args: IpcInvokeMap[C]["args"]) => IpcInvokeMap[C]["return"] | Promise<IpcInvokeMap[C]["return"]>
): void {
  ipcMain.handle(channel, handler as (event: IpcMainInvokeEvent, ...args: unknown[]) => unknown)
}

export function onIpc<C extends SendChannel>(
  ipcMain: IpcMain,
  channel: C,
  handler: (event: IpcMainEvent, ...args: IpcSendMap[C]) => void
): void {
  ipcMain.on(channel, handler as (event: IpcMainEvent, ...args: unknown[]) => void)
}
