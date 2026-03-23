import { BrowserWindow, shell } from "electron"

type CreateMainWindowDeps = {
  iconPath: string
  preloadPath: string
  rendererHtmlPath: string
  rendererUrl?: string
  isDev: boolean
  onReadyToShow?: () => void
}

export function createMainWindow({
  iconPath,
  preloadPath,
  rendererHtmlPath,
  rendererUrl,
  isDev,
  onReadyToShow
}: CreateMainWindowDeps): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    icon: iconPath,
    webPreferences: {
      preload: preloadPath,
      sandbox: false
    }
  })

  mainWindow.on("ready-to-show", () => {
    mainWindow.show()
    onReadyToShow?.()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    void shell.openExternal(details.url)
    return { action: "deny" }
  })

  if (isDev && rendererUrl) {
    void mainWindow.loadURL(rendererUrl)
  } else {
    void mainWindow.loadFile(rendererHtmlPath)
  }

  return mainWindow
}
