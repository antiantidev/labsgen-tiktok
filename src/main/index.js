const { app, shell, BrowserWindow, ipcMain } = require("electron");
const { join } = require("path");
const { electronApp, optimizer, is } = require("@electron-toolkit/utils");
const { autoUpdater } = require("electron-updater");

const configService = require("../../services/configService");
const streamlabs = require("../../services/streamlabs");
const seleniumToken = require("../../services/seleniumToken");

// Configure autoUpdater
autoUpdater.autoDownload = false; // We want to ask the user first
autoUpdater.autoInstallOnAppQuit = true;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    frame: false, // Custom titlebar
    transparent: true,
    ...(process.platform === "linux" ? {} : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }

  // Auto-update listeners
  autoUpdater.on("update-available", (info) => {
    mainWindow.webContents.send("update-available", {
      latest: info.version,
      current: app.getVersion(),
      releaseNotes: info.releaseNotes
    });
  });

  autoUpdater.on("update-downloaded", () => {
    mainWindow.webContents.send("update-downloaded");
  });

  autoUpdater.on("error", (err) => {
    console.error("Update error:", err);
    mainWindow.webContents.send("update-error", err.message);
  });

  return mainWindow;
}

app.whenReady().then(() => {
  electronApp.setAppId("com.labs-gen-tik.app");

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  const win = createWindow();

  // Check for updates on startup
  if (!is.dev) {
    autoUpdater.checkForUpdatesAndNotify();
  }

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle("load-config", () => configService.loadConfig());
ipcMain.handle("save-config", (_, data) => configService.saveConfig(data));

ipcMain.handle("set-token", (_, token) => streamlabs.setToken(token));
ipcMain.handle("refresh-account", () => streamlabs.refreshAccount());
ipcMain.handle("search-games", (_, text) => streamlabs.searchGames(text));
ipcMain.handle("start-stream", (_, data) => streamlabs.startStream(data));
ipcMain.handle("end-stream", () => streamlabs.endStream());
ipcMain.handle("set-stream-id", (_, id) => streamlabs.setStreamId(id));

ipcMain.handle("load-local-token", () => seleniumToken.loadLocalToken());
ipcMain.handle("load-web-token", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  return seleniumToken.loadWebToken(win, (status) => {
    event.sender.send("token-status", status);
  });
});

ipcMain.on("window-minimize", (event) => {
  BrowserWindow.fromWebContents(event.sender).minimize();
});
ipcMain.on("window-maximize", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win.isMaximized()) win.unmaximize();
  else win.maximize();
});
ipcMain.on("window-close", (event) => {
  BrowserWindow.fromWebContents(event.sender).close();
});

ipcMain.on("open-external", (_, url) => {
  shell.openExternal(url);
});

ipcMain.on("renderer-ready", () => {
  // Can be used to trigger actions when UI is ready
});

// Auto-update IPCs
ipcMain.on("start-download", () => {
  autoUpdater.downloadUpdate();
});

ipcMain.on("quit-and-install", () => {
  autoUpdater.quitAndInstall();
});

ipcMain.handle("get-app-version", () => app.getVersion());