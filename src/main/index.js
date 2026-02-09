const { app, shell, BrowserWindow, ipcMain, Menu, Tray, nativeImage } = require("electron");
const { join } = require("path");
const { optimizer, is } = require("@electron-toolkit/utils");
const { autoUpdater } = require("electron-updater");
const os = require("os");

const { StreamService } = require("../../services/streamlabs");
const { TokenService } = require("../../services/tokenService");
const { DriverService } = require("../../services/driverService");
const { DBService } = require("../../services/dbService");
const seleniumToken = require("../../services/seleniumToken");
const EncryptionService = require("../../services/encryptionService");

const DEFAULT_PROFILES_DIR = join(app.getPath("userData"), "profiles");

const fs = require("fs");

let tray = null;
let mainWindow = null;
let logSender = null;
const LOG_RETENTION = 5000;

// Initialize Database
const dbService = new DBService(app.getPath("userData"));
const dbReady = dbService.init();

function addSystemLog(level, message) {
  try {
    const timestamp = new Date().toISOString();
    const result = dbService.addSystemLog(level, message, timestamp);
    dbService.pruneSystemLogs(LOG_RETENTION);
    const entry = {
      id: result.lastInsertRowid,
      level,
      message,
      timestamp
    };
    if (logSender && !logSender.isDestroyed()) {
      logSender.send("system-log", entry);
    }
    return entry;
  } catch (err) {
    console.error("Failed to add system log:", err);
    return null;
  }
}

function getProfilesDir() {
  try {
    const state = dbService.getSetting("app_state", {});
    return (state.settings && state.settings.customProfilePath) || DEFAULT_PROFILES_DIR;
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

function createTray(win) {
  const possiblePaths = [
    join(__dirname, "../../resources/icon.ico"),
    join(__dirname, "../../resources/icon.png"),
    join(app.getAppPath(), "resources", "icon.ico"),
    join(app.getAppPath(), "resources", "icon.png"),
    join(process.resourcesPath, "app.asar.unpacked/resources/icon.ico"),
    join(process.resourcesPath, "app.asar.unpacked/resources/icon.png"),
    join(process.resourcesPath, "resources/icon.ico"),
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
    { label: 'LABGEN TIKTOK', enabled: false },
    { type: 'separator' },
    { label: 'Show Application', click: () => { win.show(); } },
    { label: 'Quit', click: () => { 
      app.isQuitting = true;
      app.quit(); 
    } }
  ]);

  tray.setToolTip('LABGEN TIKTOK');
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
    addSystemLog("info", "Window ready");
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
    addSystemLog("info", `Update available: ${info.version}`);
    mainWindow.webContents.send("update-available", {
      latest: info.version,
      current: app.getVersion(),
      releaseNotes: info.releaseNotes
    });
  });

  autoUpdater.on("update-downloaded", () => {
    addSystemLog("success", "Update downloaded");
    mainWindow.webContents.send("update-downloaded");
  });

  autoUpdater.on("error", (err) => {
    console.error("Update error:", err);
    addSystemLog("error", `Update error: ${err.message}`);
    mainWindow.webContents.send("update-error", err.message);
  });

  return mainWindow;
}

app.whenReady().then(() => {
  app.setAppUserModelId("com.labgen-tiktok.app");
  addSystemLog(dbReady ? "success" : "error", dbReady ? "Database initialized" : "Database init failed");
  addSystemLog("info", `App ready v${app.getVersion()}`);

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  const win = createWindow();
  createTray(win);
  logSender = win.webContents;

  if (!is.dev) {
    addSystemLog("info", "Auto update check on launch");
    autoUpdater.checkForUpdatesAndNotify();
  }
});

app.on("window-all-closed", () => {
  app.quit();
});

// --- IPC Handlers ---

ipcMain.handle("select-folder", async () => {
  const { dialog } = require("electron");
  const result = await dialog.showOpenDialog({ properties: ["openDirectory", "createDirectory"] });
  return (!result.canceled && result.filePaths.length > 0) ? result.filePaths[0] : null;
});
ipcMain.handle("open-path", async (_, path) => (path ? await shell.openPath(path) : false));
ipcMain.handle("get-default-path", () => DEFAULT_PROFILES_DIR);
ipcMain.handle("get-all-paths", () => ({
  app: app.getAppPath(),
  userData: app.getPath("userData"),
  config: dbService.getDbPath(),
  temp: app.getPath("temp"),
  exe: app.getPath("exe"),
  driver: driverService.getExecutablePath()
}));

ipcMain.handle("get-performance", () => {
  const metrics = app.getAppMetrics();
  let cpuPercent = 0;
  let memUsedBytes = 0;

  for (const m of metrics) {
    if (m.cpu && typeof m.cpu.percentCPUUsage === "number") {
      cpuPercent += m.cpu.percentCPUUsage;
    }
    if (m.memory && typeof m.memory.privateBytes === "number") {
      memUsedBytes += m.memory.privateBytes * 1024;
    } else if (m.memory && typeof m.memory.workingSetSize === "number") {
      memUsedBytes += m.memory.workingSetSize * 1024;
    }
  }

  const totalMem = os.totalmem();
  const memPercent = totalMem > 0 ? (memUsedBytes / totalMem) * 100 : 0;

  return {
    ok: true,
    cpuPercent: Math.max(0, Math.min(100, cpuPercent)),
    memPercent: Math.max(0, Math.min(100, memPercent)),
    memUsedMB: memUsedBytes / (1024 * 1024),
    memTotalMB: totalMem / (1024 * 1024)
  };
});

ipcMain.handle("db-get-accounts", () => {
  const accounts = dbService.getAllAccounts();
  return accounts.map(acc => ({ ...acc, token: EncryptionService.decrypt(acc.token) }));
});
ipcMain.handle("db-save-account", (_, acc) => dbService.saveAccount({ ...acc, token: EncryptionService.encrypt(acc.token) }));
ipcMain.handle("db-update-username", (_, { id, username }) => dbService.db.prepare('UPDATE accounts SET username = ?, lastUsed = ? WHERE id = ?').run(username, Date.now(), id));
ipcMain.handle("db-delete-account", (_, id) => dbService.deleteAccount(id));
ipcMain.handle("db-get-setting", (_, key, defaultValue) => dbService.getSetting(key, defaultValue));
ipcMain.handle("db-save-setting", (_, key, value) => dbService.saveSetting(key, value));

ipcMain.handle("sync-categories", async () => {
  try {
    addSystemLog("info", "Sync categories started");
    dbService.clearCategories();
    const popularKeywords = ["", "a", "e", "i", "o", "u", "live", "game", "music", "talk", "movie", "sport"];
    let totalSynced = 0;
    for (const kw of popularKeywords) {
      const list = await streamService.search(kw);
      if (list && list.length > 0) {
        dbService.saveCategories(list);
        totalSynced += list.length;
      }
      await new Promise(r => setTimeout(r, 200));
    }
    const count = dbService.getCategoryCount();
    addSystemLog("success", `Sync categories done: ${totalSynced} added (${count} total)`);
    return { ok: true, count, added: totalSynced };
  } catch (err) {
    addSystemLog("error", `Sync categories failed: ${err.message}`);
    return { ok: false, error: err.message };
  }
});
ipcMain.handle("get-category-count", () => dbService.getCategoryCount());
ipcMain.handle("get-category-by-name", (_, name) => dbService.getCategoryByName(name));
ipcMain.handle("search-games", async (_, text) => {
  const localResults = dbService.searchLocalCategories(text);
  if (text.length > 2 && localResults.length < 5) {
    try {
      const apiResults = await streamService.search(text);
      if (apiResults && apiResults.length > 0) {
        dbService.saveCategories(apiResults);
        return { ok: true, categories: apiResults };
      }
    } catch (e) {}
  }
  return { ok: true, categories: localResults };
});

ipcMain.handle("set-token", (_, token) => streamService.setToken(token));
ipcMain.handle("refresh-account", () => {
  addSystemLog("info", "Account refresh started");
  return streamService.getInfo()
    .then(info => {
      addSystemLog("success", "Account refresh success");
      return { ok: true, info };
    })
    .catch(err => {
      addSystemLog("error", `Account refresh failed: ${err.message}`);
      return { ok: false, error: err.message };
    });
});
ipcMain.handle("start-stream", (_, data) => {
  addSystemLog("info", "Start ingest requested");
  return streamService.start(data.title, data.category, data.audienceType)
    .then(result => {
      addSystemLog("success", "Ingest initialized");
      return { ok: true, result };
    })
    .catch(err => {
      addSystemLog("error", `Ingest start failed: ${err.message}`);
      return { ok: false, error: err.message };
    });
});
ipcMain.handle("end-stream", () => {
  addSystemLog("info", "End ingest requested");
  return streamService.end()
    .then(ok => {
      if (ok) addSystemLog("success", "Ingest ended");
      return { ok };
    })
    .catch(err => {
      addSystemLog("error", `End ingest failed: ${err.message}`);
      return { ok: false, error: err.message };
    });
});
ipcMain.handle("set-stream-id", (_, id) => {
  addSystemLog("info", `Stream ID set: ${id || "none"}`);
  return streamService.setStreamId(id);
});

ipcMain.handle("bootstrap-driver", async (event) => {
  try {
    addSystemLog("info", "ChromeDriver bootstrap started");
    if (await driverService.checkDriver()) return { ok: true, alreadyExists: true };
    await driverService.setupDriver((status) => event.sender.send("token-status", status));
    addSystemLog("success", "ChromeDriver installed");
    return { ok: true };
  } catch (err) { return { ok: false, error: err.message }; }
});
ipcMain.handle("check-driver-exists", () => driverService.checkDriver());
ipcMain.handle("load-local-token", () => tokenService.loadLocalToken());
ipcMain.handle("load-web-token", (event, options = {}) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const profilesDir = getProfilesDir();
  const profilePath = options.accountId ? join(profilesDir, options.accountId) : join(profilesDir, `profile_${Date.now()}`);
  return seleniumToken.loadWebToken(win, (status) => event.sender.send("token-status", status), { 
    profilePath, binaryPath: driverService.getExecutablePath() 
  });
});
ipcMain.handle("delete-profile", (_, accountId) => {
  if (!accountId) return false;
  const profilePath = join(getProfilesDir(), accountId);
  try { if (fs.existsSync(profilePath)) fs.rmSync(profilePath, { recursive: true, force: true }); return true; } 
  catch (err) { return false; }
});

ipcMain.on("window-minimize", (event) => BrowserWindow.fromWebContents(event.sender).minimize());
ipcMain.on("window-maximize", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  win.isMaximized() ? win.unmaximize() : win.maximize();
});
ipcMain.on("window-close", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const state = dbService.getSetting("app_state", {});
  if (state.settings && state.settings.minimizeOnClose) {
    addSystemLog("info", "Window minimized to tray");
    win.hide();
  } else {
    addSystemLog("info", "App quit requested");
    app.isQuitting = true;
    win.close();
  }
});

ipcMain.on("open-external", (_, url) => shell.openExternal(url));
ipcMain.on("renderer-ready", () => {});
ipcMain.on("start-download", () => autoUpdater.downloadUpdate());
ipcMain.on("quit-and-install", () => { app.isQuitting = true; autoUpdater.quitAndInstall(); });
ipcMain.handle("get-app-version", () => app.getVersion());
ipcMain.handle("check-for-updates", async () => {
  if (!app.isPackaged) return { ok: true, devMode: true };
  try {
    addSystemLog("info", "Update check started");
    const result = await autoUpdater.checkForUpdates();
    if (result && result.updateInfo.version === app.getVersion()) return { ok: true, upToDate: true };
    addSystemLog("info", "Update check completed");
    return { ok: true, upToDate: false, updateInfo: result ? result.updateInfo : null };
  } catch (err) {
    addSystemLog("error", `Update check failed: ${err.message}`);
    return err.message.includes("No published versions") ? { ok: true, upToDate: true } : { ok: false, error: err.message };
  }
});

ipcMain.handle("system-log-add", (_, { level, message }) => addSystemLog(level, message));
ipcMain.handle("system-log-get", (_, params = {}) => {
  const limit = params.limit ?? 100;
  const offset = params.offset ?? 0;
  return dbService.getSystemLogs(limit, offset);
});
ipcMain.handle("system-log-count", () => dbService.getSystemLogCount());
ipcMain.handle("system-log-clear", () => dbService.clearSystemLogs());
