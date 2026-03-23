import { optimizer } from "@electron-toolkit/utils"
import type { App, BrowserWindow, Tray, WebContents } from "electron"
import { createMainWindow } from "../window/createMainWindow"
import { createTray } from "../window/createTray"
import { registerUpdaterEvents } from "../updater/registerUpdaterEvents"

type BootstrapAppDeps = {
  app: App
  autoUpdater: {
    checkForUpdates: () => Promise<unknown>
    on: {
      (event: "update-available", listener: (info: { version: string; releaseNotes?: unknown }) => void): unknown
      (event: "update-downloaded", listener: () => void): unknown
      (event: "download-progress", listener: (progress: { percent?: number; transferred?: number; total?: number; bytesPerSecond?: number }) => void): unknown
      (event: "error", listener: (err: unknown) => void): unknown
    }
  }
  isDev: boolean
  appUserModelId: string
  dbReady: boolean
  addSystemLog: (level: string, message: string) => unknown
  getErrorMessage: (err: unknown) => string
  ensureProfilesDir: () => void
  setLogSender: (sender: WebContents | null) => void
  setMainWindow: (win: BrowserWindow) => void
  setTray: (tray: Tray) => void
  windowConfig: {
    iconPath: string
    preloadPath: string
    rendererHtmlPath: string
    rendererUrl?: string
  }
}

export function bootstrapApp({
  app,
  autoUpdater,
  isDev,
  appUserModelId,
  dbReady,
  addSystemLog,
  getErrorMessage,
  ensureProfilesDir,
  setLogSender,
  setMainWindow,
  setTray,
  windowConfig
}: BootstrapAppDeps): void {
  app.whenReady().then(() => {
    app.setAppUserModelId(appUserModelId)
    addSystemLog(dbReady ? "success" : "error", dbReady ? "Database initialized" : "Database init failed")
    addSystemLog("info", `App ready v${app.getVersion()}`)

    ensureProfilesDir()

    app.on("browser-window-created", (_event, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    const win = createMainWindow({
      iconPath: windowConfig.iconPath,
      preloadPath: windowConfig.preloadPath,
      rendererHtmlPath: windowConfig.rendererHtmlPath,
      rendererUrl: windowConfig.rendererUrl,
      isDev,
      onReadyToShow: () => addSystemLog("info", "Window ready")
    })
    setMainWindow(win)
    registerUpdaterEvents({ app, autoUpdater, win, addSystemLog, getErrorMessage })
    setTray(createTray({ app, win }))
    setLogSender(win.webContents)

    if (!isDev) {
      addSystemLog("info", "Auto update check on launch")
      void autoUpdater.checkForUpdates()
    }
  })

  app.on("window-all-closed", () => {
    app.quit()
  })
}
