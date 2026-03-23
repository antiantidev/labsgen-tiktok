import { ipcRenderer } from "electron"
import type { IpcInvokeMap, IpcMainToRendererEventMap, IpcSendMap } from "../shared/ipc/protocol"

type InvokeChannel = keyof IpcInvokeMap
type SendChannel = keyof IpcSendMap
type MainToRendererChannel = keyof IpcMainToRendererEventMap

export function invokeIpc<C extends InvokeChannel>(channel: C, ...args: IpcInvokeMap[C]["args"]): Promise<IpcInvokeMap[C]["return"]> {
  return ipcRenderer.invoke(channel, ...args) as Promise<IpcInvokeMap[C]["return"]>
}

export function sendIpc<C extends SendChannel>(channel: C, ...args: IpcSendMap[C]): void {
  ipcRenderer.send(channel, ...(args as unknown[]))
}

export function onIpc<C extends MainToRendererChannel>(
  channel: C,
  callback: (payload: IpcMainToRendererEventMap[C]) => void
): () => void {
  const subscription = (_event: unknown, payload: unknown) => callback(payload as IpcMainToRendererEventMap[C])
  ipcRenderer.on(channel, subscription)
  return () => ipcRenderer.removeListener(channel, subscription)
}
