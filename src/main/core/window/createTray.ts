import { Menu, Tray, nativeImage, type BrowserWindow, type App } from "electron"
import { join } from "node:path"
import fs from "node:fs"
import type { AppWithQuitState } from "../types"

type CreateTrayDeps = {
  app: App
  win: BrowserWindow
}

export function createTray({ app, win }: CreateTrayDeps): Tray {
  const possiblePaths = [
    join(__dirname, "../../resources/icon.ico"),
    join(__dirname, "../../resources/icon.png"),
    join(__dirname, "../../../resources/icon.ico"),
    join(__dirname, "../../../resources/icon.png"),
    join(app.getAppPath(), "resources", "icon.ico"),
    join(app.getAppPath(), "resources", "icon.png"),
    join(process.resourcesPath, "app.asar.unpacked/resources/icon.ico"),
    join(process.resourcesPath, "app.asar.unpacked/resources/icon.png"),
    join(process.resourcesPath, "icon.ico"),
    join(process.resourcesPath, "icon.png"),
    join(process.resourcesPath, "resources/icon.ico"),
    join(process.resourcesPath, "resources/icon.png")
  ]

  let icon = null
  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      icon = nativeImage.createFromPath(filePath)
      if (!icon.isEmpty()) break
    }
  }

  if (!icon || icon.isEmpty()) {
    const executableIcon = nativeImage.createFromPath(app.getPath("exe"))
    icon = executableIcon.isEmpty() ? nativeImage.createEmpty() : executableIcon
  }

  const tray = new Tray(icon)
  const contextMenu = Menu.buildFromTemplate([
    { label: "Labsgen Tiktok", enabled: false },
    { type: "separator" },
    { label: "Show Application", click: () => win.show() },
    {
      label: "Quit",
      click: () => {
        ;(app as AppWithQuitState).isQuitting = true
        app.quit()
      }
    }
  ])

  tray.setToolTip("Labsgen Tiktok")
  tray.setContextMenu(contextMenu)
  tray.on("double-click", () => {
    win.isVisible() ? win.hide() : win.show()
  })

  return tray
}
