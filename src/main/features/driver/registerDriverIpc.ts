import { BrowserWindow, type IpcMain } from "electron"
import { join } from "node:path"
import fs from "node:fs"
import { IPC_CHANNELS } from "../../../shared/ipc/channels"
import { handleIpc } from "../../core/ipc/mainIpc"

type DriverDeps = {
  ipcMain: IpcMain
  addSystemLog: (level: string, message: string) => void
  serializeError: (err: unknown) => { error: string; code: string | null }
  driverService: {
    ensureDriver: (onProgress?: (status: string) => void) => Promise<{ alreadyExists?: boolean }>
    checkDriver: () => Promise<boolean>
    getExecutablePath: () => string
  }
  tokenService: {
    loadLocalToken: () => { token: string | null; error?: string | null }
  }
  seleniumToken: {
    loadWebToken: (
      win: BrowserWindow | null,
      onStatus: (status: string) => void,
      opts: { profilePath: string; driverPath: string }
    ) => Promise<{ token: string | null; error?: string }>
  }
  getProfilesDir: () => string
}

export function registerDriverIpc(deps: DriverDeps): void {
  const { ipcMain, addSystemLog, serializeError, driverService, tokenService, seleniumToken, getProfilesDir } = deps

  handleIpc(ipcMain, IPC_CHANNELS.BOOTSTRAP_DRIVER, async (event) => {
    try {
      addSystemLog("info", "ChromeDriver bootstrap started")
      const result = await driverService.ensureDriver((status) => event.sender.send(IPC_CHANNELS.TOKEN_STATUS, status))
      addSystemLog("success", result.alreadyExists ? "ChromeDriver already up to date" : "ChromeDriver installed")
      return { ok: true as const, alreadyExists: !!result.alreadyExists }
    } catch (err) {
      return { ok: false as const, ...serializeError(err) }
    }
  })

  handleIpc(ipcMain, IPC_CHANNELS.CHECK_DRIVER_EXISTS, () => driverService.checkDriver())
  handleIpc(ipcMain, IPC_CHANNELS.LOAD_LOCAL_TOKEN, () => tokenService.loadLocalToken())

  handleIpc(ipcMain, IPC_CHANNELS.LOAD_WEB_TOKEN, async (event, options: { accountId?: string | null } = {}) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    const profilesDir = getProfilesDir()
    const profilePath = options.accountId ? join(profilesDir, options.accountId) : join(profilesDir, `profile_${Date.now()}`)

    try {
      await driverService.ensureDriver((status) => event.sender.send(IPC_CHANNELS.TOKEN_STATUS, status))
    } catch (err) {
      return { token: null, ...serializeError(err) }
    }

    return seleniumToken.loadWebToken(win, (status) => event.sender.send(IPC_CHANNELS.TOKEN_STATUS, status), {
      profilePath,
      driverPath: driverService.getExecutablePath()
    })
  })

  handleIpc(ipcMain, IPC_CHANNELS.DELETE_PROFILE, (_event, accountId?: string) => {
    if (!accountId) return false
    const profilePath = join(getProfilesDir(), accountId)
    try {
      if (fs.existsSync(profilePath)) {
        fs.rmSync(profilePath, { recursive: true, force: true })
      }
      return true
    } catch {
      return false
    }
  })
}
