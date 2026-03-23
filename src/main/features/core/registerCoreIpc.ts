import { app, BrowserWindow, dialog, shell, type IpcMain } from "electron"
import os from "node:os"
import { IPC_CHANNELS } from "../../../shared/ipc/channels"
import { handleIpc, onIpc } from "../../core/ipc/mainIpc"
import type {
  AppWithQuitState,
  DBAccountRecord,
  DBServiceLike,
  DriverServiceLike,
  EncryptionServiceLike,
  StreamServiceLike
} from "../../core/types"

type RegisterCoreIpcDeps = {
  ipcMain: IpcMain
  defaultProfilesDir: string
  dbService: DBServiceLike
  driverService: DriverServiceLike
  streamService: StreamServiceLike
  encryptionService: EncryptionServiceLike
  addSystemLog: (level: string, message: string) => unknown
  getErrorMessage: (err: unknown) => string
  getAppState: () => { settings?: { minimizeOnClose?: boolean } }
}

export function registerCoreIpc({
  ipcMain,
  defaultProfilesDir,
  dbService,
  driverService,
  streamService,
  encryptionService,
  addSystemLog,
  getErrorMessage,
  getAppState
}: RegisterCoreIpcDeps): void {
  handleIpc(ipcMain, IPC_CHANNELS.SELECT_FOLDER, async () => {
    const result = await dialog.showOpenDialog({ properties: ["openDirectory", "createDirectory"] })
    return !result.canceled && result.filePaths.length > 0 ? result.filePaths[0] : null
  })

  handleIpc(ipcMain, IPC_CHANNELS.OPEN_PATH, async (_event, targetPath: string) => (targetPath ? shell.openPath(targetPath) : false))
  handleIpc(ipcMain, IPC_CHANNELS.GET_DEFAULT_PATH, () => defaultProfilesDir)
  handleIpc(ipcMain, IPC_CHANNELS.GET_ALL_PATHS, () => ({
    app: app.getAppPath(),
    userData: app.getPath("userData"),
    config: dbService.getDbPath(),
    temp: app.getPath("temp"),
    exe: app.getPath("exe"),
    driver: driverService.getExecutablePath()
  }))

  handleIpc(ipcMain, IPC_CHANNELS.GET_PERFORMANCE, () => {
    const metrics = app.getAppMetrics()
    let cpuPercent = 0
    let memUsedBytes = 0

    for (const metric of metrics) {
      if (metric.cpu && typeof metric.cpu.percentCPUUsage === "number") {
        cpuPercent += metric.cpu.percentCPUUsage
      }
      if (metric.memory && typeof metric.memory.privateBytes === "number") {
        memUsedBytes += metric.memory.privateBytes * 1024
      } else if (metric.memory && typeof metric.memory.workingSetSize === "number") {
        memUsedBytes += metric.memory.workingSetSize * 1024
      }
    }

    const totalMem = os.totalmem()
    const memPercent = totalMem > 0 ? (memUsedBytes / totalMem) * 100 : 0

    return {
      ok: true,
      cpuPercent: Math.max(0, Math.min(100, cpuPercent)),
      memPercent: Math.max(0, Math.min(100, memPercent)),
      memUsedMB: memUsedBytes / (1024 * 1024),
      memTotalMB: totalMem / (1024 * 1024)
    }
  })

  handleIpc(ipcMain, IPC_CHANNELS.DB_GET_ACCOUNTS, () => {
    const accounts = dbService.getAllAccounts()
    return accounts.map((acc) => ({ ...acc, token: encryptionService.decrypt(acc.token) }))
  })
  handleIpc(ipcMain, IPC_CHANNELS.DB_SAVE_ACCOUNT, (_event, acc: DBAccountRecord) =>
    dbService.saveAccount({ ...acc, token: encryptionService.encrypt(acc.token) })
  )
  handleIpc(ipcMain, IPC_CHANNELS.DB_UPDATE_USERNAME, (_event, payload: { id: string; username: string }) =>
    dbService.db.prepare("UPDATE accounts SET username = ?, lastUsed = ? WHERE id = ?").run(payload.username, Date.now(), payload.id)
  )
  handleIpc(ipcMain, IPC_CHANNELS.DB_DELETE_ACCOUNT, (_event, id: string) => dbService.deleteAccount(id))
  handleIpc(ipcMain, IPC_CHANNELS.DB_GET_SETTING, (_event, key: string, defaultValue: unknown) => dbService.getSetting(key, defaultValue))
  handleIpc(ipcMain, IPC_CHANNELS.DB_SAVE_SETTING, (_event, key: string, value: unknown) => dbService.saveSetting(key, value))

  handleIpc(ipcMain, IPC_CHANNELS.SYNC_CATEGORIES, async () => {
    try {
      addSystemLog("info", "Sync categories started")
      dbService.clearCategories()
      const popularKeywords = ["", "a", "e", "i", "o", "u", "live", "game", "music", "talk", "movie", "sport"]
      let totalSynced = 0
      for (const keyword of popularKeywords) {
        const list = await streamService.search(keyword)
        if (list && list.length > 0) {
          dbService.saveCategories(list)
          totalSynced += list.length
        }
        await new Promise((resolve) => setTimeout(resolve, 200))
      }
      const count = dbService.getCategoryCount()
      addSystemLog("success", `Sync categories done: ${totalSynced} added (${count} total)`)
      return { ok: true, count, added: totalSynced }
    } catch (err) {
      const message = getErrorMessage(err)
      addSystemLog("error", `Sync categories failed: ${message}`)
      return { ok: false, error: message }
    }
  })
  handleIpc(ipcMain, IPC_CHANNELS.GET_CATEGORY_COUNT, () => dbService.getCategoryCount())
  handleIpc(ipcMain, IPC_CHANNELS.GET_CATEGORY_BY_NAME, (_event, name: string) => dbService.getCategoryByName(name))
  handleIpc(ipcMain, IPC_CHANNELS.SEARCH_GAMES, async (_event, text: string) => {
    const localResults = dbService.searchLocalCategories(text)
    if (text.length > 2 && localResults.length < 5) {
      try {
        const apiResults = await streamService.search(text)
        if (apiResults && apiResults.length > 0) {
          dbService.saveCategories(apiResults)
          return { ok: true, categories: apiResults }
        }
      } catch {}
    }
    return { ok: true, categories: localResults }
  })

  handleIpc(ipcMain, IPC_CHANNELS.SET_TOKEN, (_event, token: string) => streamService.setToken(token))
  handleIpc(ipcMain, IPC_CHANNELS.REFRESH_ACCOUNT, () => {
    addSystemLog("info", "Account refresh started")
    return streamService
      .getInfo()
      .then((info) => {
        addSystemLog("success", "Account refresh success")
        return { ok: true, info }
      })
      .catch((err) => {
        const message = getErrorMessage(err)
        addSystemLog("error", `Account refresh failed: ${message}`)
        return { ok: false, error: message }
      })
  })
  handleIpc(ipcMain, IPC_CHANNELS.START_STREAM, (_event, data: { title: string; category: string; audienceType: string }) => {
    addSystemLog("info", "Start ingest requested")
    return streamService
      .start(data.title, data.category, data.audienceType)
      .then((result) => {
        addSystemLog("success", "Ingest initialized")
        return { ok: true, result }
      })
      .catch((err) => {
        const message = getErrorMessage(err)
        addSystemLog("error", `Ingest start failed: ${message}`)
        return { ok: false, error: message }
      })
  })
  handleIpc(ipcMain, IPC_CHANNELS.END_STREAM, () => {
    addSystemLog("info", "End ingest requested")
    return streamService
      .end()
      .then((ok) => {
        if (ok) addSystemLog("success", "Ingest ended")
        return { ok }
      })
      .catch((err) => {
        const message = getErrorMessage(err)
        addSystemLog("error", `End ingest failed: ${message}`)
        return { ok: false, error: message }
      })
  })
  handleIpc(ipcMain, IPC_CHANNELS.SET_STREAM_ID, (_event, id: string | null) => {
    addSystemLog("info", `Stream ID set: ${id || "none"}`)
    return streamService.setStreamId(id)
  })

  onIpc(ipcMain, IPC_CHANNELS.WINDOW_MINIMIZE, (event) => BrowserWindow.fromWebContents(event.sender)?.minimize())
  onIpc(ipcMain, IPC_CHANNELS.WINDOW_MAXIMIZE, (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return
    win.isMaximized() ? win.unmaximize() : win.maximize()
  })
  onIpc(ipcMain, IPC_CHANNELS.WINDOW_CLOSE, (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return
    const state = getAppState()
    if (state.settings?.minimizeOnClose) {
      addSystemLog("info", "Window minimized to tray")
      win.hide()
    } else {
      addSystemLog("info", "App quit requested")
      ;(app as AppWithQuitState).isQuitting = true
      win.close()
    }
  })

  onIpc(ipcMain, IPC_CHANNELS.OPEN_EXTERNAL, (_event, url: string) => {
    void shell.openExternal(url)
  })
  onIpc(ipcMain, IPC_CHANNELS.RENDERER_READY, () => {})
}
