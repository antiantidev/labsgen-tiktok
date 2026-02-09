const { app, shell, BrowserWindow, ipcMain, Menu, Tray, nativeImage } = require("electron");
const { join } = require("path");
const { optimizer, is } = require("@electron-toolkit/utils");
const { autoUpdater } = require("electron-updater");

const configService = require("../../services/configService");
const { StreamService } = require("../../services/streamlabs");
const { TokenService } = require("../../services/tokenService");
const { DriverService } = require("../../services/driverService");
const { DBService } = require("../../services/dbService");
const seleniumToken = require("../../services/seleniumToken");

const CONFIG_PATH = join(app.getPath("userData"), "config.json");
const DEFAULT_PROFILES_DIR = join(app.getPath("userData"), "profiles");

const fs = require("fs");

let tray = null;
let mainWindow = null;

// Initialize Database
const dbService = new DBService(app.getPath("userData"));
dbService.init();

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
const driverService = new DriverService(app.getAppPath(), app.getPath("userData"));

// ... (CreateTray, CreateWindow - Assume unchanged)

function createTray(win) {
  const possiblePaths = [
    join(__dirname, "../../resources/icon.png"),
    join(app.getAppPath(), "resources", "icon.png"),
    join(process.resourcesPath, "app.asar.unpacked/resources/icon.png"),
    join(process.resourcesPath, "resources/icon.png")
  ];
  
  let icon = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      icon = nativeImage.createFromPath(p);
      if (!icon.isEmpty()) break;
    }
  }

  if (!icon || icon.isEmpty()) {
    icon = nativeImage.createEmpty();
  }

  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'LabsGen TikTok', enabled: false },
    { type: 'separator' },
    { label: 'Show Application', click: () => { win.show(); } },
    { label: 'Quit', click: () => { 
      app.isQuitting = true;
      app.quit(); 
    } }
  ]);

  tray.setToolTip('LabsGen TikTok');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    win.isVisible() ? win.hide() : win.show();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    frame: false, 
    transparent: true,
    backgroundColor: '#00000000',
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
  app.setAppUserModelId("com.labs-gen-tik.app");

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  const win = createWindow();
  createTray(win);

  if (!is.dev) {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

app.on("window-all-closed", () => {
  app.quit();
});

// IPC Handlers
ipcMain.handle("load-config", () => configService.loadConfig(CONFIG_PATH));
ipcMain.handle("save-config", (_, data) => {
  const result = configService.saveConfig(CONFIG_PATH, data);
  ensureProfilesDir();
  return result;
});

// SQLite Handlers
ipcMain.handle("db-get-accounts", () => dbService.getAllAccounts());
ipcMain.handle("db-save-account", (_, acc) => dbService.saveAccount(acc));
ipcMain.handle("db-delete-account", (_, id) => dbService.deleteAccount(id));

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

ipcMain.handle("get-all-paths", () => {
  return {
    app: app.getAppPath(),
    userData: app.getPath("userData"),
    config: CONFIG_PATH,
    temp: app.getPath("temp"),
    exe: app.getPath("exe"),
    driver: driverService.getExecutablePath()
  };
});

ipcMain.handle("bootstrap-driver", async (event) => {
  try {
    const exists = await driverService.checkDriver();
    if (exists) return { ok: true, alreadyExists: true };

    await driverService.setupDriver((status) => {
      event.sender.send("token-status", status);
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

ipcMain.handle("check-driver-exists", () => driverService.checkDriver());

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
  
  let profilePath = null;
  if (options.accountId) {
    profilePath = join(profilesDir, options.accountId);
  } else {
    const newId = `profile_${Date.now()}`;
    profilePath = join(profilesDir, newId);
  }

  return seleniumToken.loadWebToken(win, (status) => {
    event.sender.send("token-status", status);
  }, { 
    profilePath,
    binaryPath: driverService.getExecutablePath()
  });
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
  const win = BrowserWindow.fromWebContents(event.sender);
  const config = configService.loadConfig(CONFIG_PATH);
  
  if (config.settings && config.settings.minimizeOnClose) {
    win.hide();
  } else {
    app.isQuitting = true;
    win.close();
  }
});

ipcMain.on("open-external", (_, url) => {
  shell.openExternal(url);
});

ipcMain.on("renderer-ready", () => {});

ipcMain.on("start-download", () => {
  autoUpdater.downloadUpdate();
});

ipcMain.on("quit-and-install", () => {
  app.isQuitting = true;
  autoUpdater.quitAndInstall();
});

ipcMain.handle("check-for-updates", async () => {
  if (!app.isPackaged) {
    return { ok: true, devMode: true };
  }
  try {
    const result = await autoUpdater.checkForUpdates();
    if (result && result.updateInfo.version === app.getVersion()) {
      return { ok: true, upToDate: true };
    }
    return { ok: true, upToDate: false, updateInfo: result ? result.updateInfo : null };
  } catch (err) {
    if (err.message.includes("No published versions")) {
      return { ok: true, upToDate: true };
    }
    return { ok: false, error: err.message };
  }
});

ipcMain.handle("get-app-version", () => app.getVersion());