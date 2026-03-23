import type { App, BrowserWindow } from "electron"
import { IPC_CHANNELS } from "../../../shared/ipc/channels"

type UpdaterInfo = {
  version: string
  releaseNotes?: unknown
}

type UpdaterProgress = {
  percent?: number
  transferred?: number
  total?: number
  bytesPerSecond?: number
}

type AutoUpdaterLike = {
  on: {
    (event: "update-available", listener: (info: UpdaterInfo) => void): unknown
    (event: "update-downloaded", listener: () => void): unknown
    (event: "download-progress", listener: (progress: UpdaterProgress) => void): unknown
    (event: "error", listener: (err: unknown) => void): unknown
  }
}

type RegisterUpdaterEventsDeps = {
  app: App
  autoUpdater: AutoUpdaterLike
  win: BrowserWindow
  addSystemLog: (level: string, message: string) => unknown
  getErrorMessage: (err: unknown) => string
}

export function registerUpdaterEvents({
  app,
  autoUpdater,
  win,
  addSystemLog,
  getErrorMessage
}: RegisterUpdaterEventsDeps): void {
  autoUpdater.on("update-available", (info) => {
    addSystemLog("info", `Update available: ${info.version}`)
    win.webContents.send(IPC_CHANNELS.UPDATE_AVAILABLE, {
      latest: info.version,
      current: app.getVersion(),
      releaseNotes: info.releaseNotes
    })
  })

  autoUpdater.on("update-downloaded", () => {
    addSystemLog("success", "Update downloaded")
    win.webContents.send(IPC_CHANNELS.UPDATE_DOWNLOADED)
  })

  autoUpdater.on("download-progress", (progress) => {
    if (win.isDestroyed()) return
    win.webContents.send(IPC_CHANNELS.UPDATE_PROGRESS, {
      percent: progress.percent || 0,
      transferred: progress.transferred || 0,
      total: progress.total || 0,
      bytesPerSecond: progress.bytesPerSecond || 0
    })
  })

  autoUpdater.on("error", (err) => {
    console.error("Update error:", err)
    addSystemLog("error", `Update error: ${getErrorMessage(err)}`)
    if (!win.isDestroyed()) {
      win.webContents.send(IPC_CHANNELS.UPDATE_ERROR, getErrorMessage(err))
    }
  })
}
