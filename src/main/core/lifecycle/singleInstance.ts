import type { App, BrowserWindow } from "electron"

type SetupSingleInstanceLockDeps = {
  app: App
  getMainWindow: () => BrowserWindow | null
}

export function setupSingleInstanceLock({ app, getMainWindow }: SetupSingleInstanceLockDeps): boolean {
  const gotSingleInstanceLock = app.requestSingleInstanceLock()
  if (!gotSingleInstanceLock) {
    app.quit()
    return false
  }

  app.on("second-instance", () => {
    const win = getMainWindow()
    if (!win) return
    if (win.isMinimized()) win.restore()
    win.show()
    win.focus()
  })

  return true
}
