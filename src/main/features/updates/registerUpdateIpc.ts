import type { App, IpcMain } from "electron"
import { IPC_CHANNELS } from "../../../shared/ipc/channels"
import { getErrorMessage } from "../../core/errors/errorUtils"
import { handleIpc, onIpc } from "../../core/ipc/mainIpc"

type UpdateDeps = {
  ipcMain: IpcMain
  app: App
  autoUpdater: {
    downloadUpdate: () => unknown
    quitAndInstall: () => unknown
    checkForUpdates: () => Promise<{ updateInfo: { version: string } } | null>
  }
  addSystemLog: (level: string, message: string) => void
}

export function registerUpdateIpc({ ipcMain, app, autoUpdater, addSystemLog }: UpdateDeps): void {
  onIpc(ipcMain, IPC_CHANNELS.START_DOWNLOAD, () => autoUpdater.downloadUpdate())
  onIpc(ipcMain, IPC_CHANNELS.QUIT_AND_INSTALL, () => {
    ;(app as App & { isQuitting?: boolean }).isQuitting = true
    autoUpdater.quitAndInstall()
  })

  handleIpc(ipcMain, IPC_CHANNELS.GET_APP_VERSION, () => app.getVersion())
  handleIpc(ipcMain, IPC_CHANNELS.CHECK_FOR_UPDATES, async () => {
    if (!app.isPackaged) return { ok: true, devMode: true }

    try {
      addSystemLog("info", "Update check started")
      const result = await autoUpdater.checkForUpdates()
      if (result && result.updateInfo.version === app.getVersion()) {
        return { ok: true, upToDate: true }
      }
      addSystemLog("info", "Update check completed")
      return { ok: true, upToDate: false, updateInfo: result ? result.updateInfo : null }
    } catch (err) {
      const message = getErrorMessage(err)
      addSystemLog("error", `Update check failed: ${message}`)
      return message.includes("No published versions") ? { ok: true, upToDate: true } : { ok: false, error: message }
    }
  })
}
