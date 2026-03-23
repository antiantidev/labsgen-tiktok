import { app, BrowserWindow, ipcMain, type Tray } from "electron"
import { registerDriverIpc } from "./features/driver/registerDriverIpc"
import { registerCoreIpc } from "./features/core/registerCoreIpc"
import { registerUpdateIpc } from "./features/updates/registerUpdateIpc"
import { registerLogIpc } from "./features/logs/registerLogIpc"
import { bootstrapApp } from "./core/bootstrap/bootstrapApp"
import { createServiceBundle } from "./core/bootstrap/createServices"
import { APP_USER_MODEL_ID, LOG_RETENTION, initializeRuntimePaths } from "./core/config/runtimeConfig"
import { getErrorMessage, serializeError } from "./core/errors/errorUtils"
import { setupSingleInstanceLock } from "./core/lifecycle/singleInstance"
import { createSystemLogService } from "./core/system/systemLogService"
import { createSettingsStore } from "./core/system/settingsStore"
import { createProfilesService } from "./core/system/profilesService"
import { join } from "node:path"
import { is } from "@electron-toolkit/utils"
import { autoUpdater } from "electron-updater"

autoUpdater.autoDownload = false

const { defaultProfilesDir: DEFAULT_PROFILES_DIR } = initializeRuntimePaths(app)

let tray: Tray | null = null
let mainWindow: BrowserWindow | null = null

setupSingleInstanceLock({ app, getMainWindow: () => mainWindow })

const { dbService, streamService, tokenService, driverService, seleniumToken, encryptionService } = createServiceBundle(app)
const dbReady = dbService.init()
const { addSystemLog, setLogSender } = createSystemLogService({ dbService, retention: LOG_RETENTION })
const { getAppState } = createSettingsStore({ dbService })
const { getProfilesDir, ensureProfilesDir } = createProfilesService({ defaultProfilesDir: DEFAULT_PROFILES_DIR, getAppState })

bootstrapApp({
  app,
  autoUpdater,
  isDev: is.dev,
  appUserModelId: APP_USER_MODEL_ID,
  dbReady,
  addSystemLog,
  getErrorMessage,
  ensureProfilesDir,
  setLogSender,
  setMainWindow: (win) => {
    mainWindow = win
  },
  setTray: (nextTray) => {
    tray = nextTray
  },
  windowConfig: {
    iconPath: join(__dirname, "../../resources/icon.ico"),
    preloadPath: join(__dirname, "../preload/index.js"),
    rendererHtmlPath: join(__dirname, "../renderer/index.html"),
    rendererUrl: process.env.ELECTRON_RENDERER_URL
  }
})

registerCoreIpc({
  ipcMain,
  defaultProfilesDir: DEFAULT_PROFILES_DIR,
  dbService,
  driverService,
  streamService,
  encryptionService,
  addSystemLog,
  getErrorMessage,
  getAppState: () => getAppState({})
})

registerDriverIpc({
  ipcMain,
  addSystemLog,
  serializeError,
  driverService,
  tokenService,
  seleniumToken,
  getProfilesDir
})
registerUpdateIpc({ ipcMain, app, autoUpdater, addSystemLog })
registerLogIpc({ ipcMain, addSystemLog, dbService })
