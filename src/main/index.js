const { app, shell, BrowserWindow, ipcMain } = require("electron");
const { join } = require("path");
const { optimizer, is } = require("@electron-toolkit/utils");
const { autoUpdater } = require("electron-updater");

const configService = require("../../services/configService");
const { StreamService } = require("../../services/streamlabs");
const { TokenService } = require("../../services/tokenService");
const seleniumToken = require("../../services/seleniumToken");

const CONFIG_PATH = join(app.getPath("userData"), "config.json");
const DEFAULT_PROFILES_DIR = join(app.getPath("userData"), "profiles");

const fs = require("fs");

function getProfilesDir() {
  try {
    const configRaw = fs.existsSync(CONFIG_PATH) ? fs.readFileSync(CONFIG_PATH, "utf8") : "{}";
    const config = JSON.parse(configRaw);
    return (config.settings && config.settings.customProfilePath) || DEFAULT_PROFILES_DIR;
  } catch (e) {
    return DEFAULT_PROFILES_DIR;
  }
}

function ensureProfilesDir() {
  const dir = getProfilesDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

ensureProfilesDir();

// Instantiate services
const streamService = new StreamService();
const tokenService = new TokenService();

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
  // Set app user model id for windows
  app.setAppUserModelId("com.labs-gen-tik.app");

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
ipcMain.handle("load-config", () => configService.loadConfig(CONFIG_PATH));
ipcMain.handle("save-config", (_, data) => {
  const result = configService.saveConfig(CONFIG_PATH, data);
  ensureProfilesDir();
  return result;
});

ipcMain.handle("select-folder", async () => {
  const { dialog } = require("electron");
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory", "createDirectory"]
  });
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle("open-path", async (_, path) => {
  if (!path) return false;
  return await shell.openPath(path);
});

ipcMain.handle("get-default-path", () => DEFAULT_PROFILES_DIR);

ipcMain.handle("set-token", (_, token) => streamService.setToken(token));
ipcMain.handle("refresh-account", () => streamService.getInfo().then(info => ({ ok: true, info })).catch(err => ({ ok: false, error: err.message })));
ipcMain.handle("search-games", (_, text) => streamService.search(text).then(categories => ({ ok: true, categories })).catch(err => ({ ok: false, error: err.message })));
ipcMain.handle("start-stream", (_, data) => streamService.start(data.title, data.category, data.audienceType).then(result => ({ ok: true, result })).catch(err => ({ ok: false, error: err.message })));
ipcMain.handle("end-stream", () => streamService.end().then(ok => ({ ok })).catch(err => ({ ok: false, error: err.message })));
ipcMain.handle("set-stream-id", (_, id) => streamService.setStreamId(id));

ipcMain.handle("load-local-token", () => tokenService.loadLocalToken());
ipcMain.handle("load-web-token", (event, options = {}) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const profilesDir = getProfilesDir();
  
  // Resolve profile path if an accountId is provided
  let profilePath = null;
  if (options.accountId) {
    profilePath = join(profilesDir, options.accountId);
  } else {
    // Generate a temporary or new ID if creating a new profile
    const newId = `profile_${Date.now()}`;
    profilePath = join(profilesDir, newId);
  }

  return seleniumToken.loadWebToken(win, (status) => {
    event.sender.send("token-status", status);
  }, { profilePath });
});

ipcMain.handle("delete-profile", (_, accountId) => {
  if (!accountId) return false;
  const profilesDir = getProfilesDir();
  const profilePath = join(profilesDir, accountId);
  try {
    if (fs.existsSync(profilePath)) {
      fs.rmSync(profilePath, { recursive: true, force: true });
    }
    return true;
  } catch (err) {
    console.error("Failed to delete profile:", err);
    return false;
  }
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