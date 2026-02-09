import { app, BrowserWindow, ipcMain, shell } from "electron";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const { loadConfig, saveConfig } = require("../../services/configService");
const { TokenService } = require("../../services/tokenService");
const { StreamService } = require("../../services/streamlabs");
const { checkUpdate } = require("../../services/updateService");
const { createPkce, exchangeCode } = require("../../services/oauth");
const { retrieveCodeWithSelenium } = require("../../services/seleniumToken");

let mainWindow = null;
let pendingUpdateInfo = null;
const tokenService = new TokenService();
const streamService = new StreamService();
const AUTH_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) StreamlabsDesktop/1.17.0 Chrome/122.0.6261.156 Electron/29.3.1 Safari/537.36";

function encodeRFC3986(value) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (c) =>
    `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 900,
    minHeight: 640,
    frame: false,
    backgroundColor: "#0a0a0a",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.setMenu(null);
  mainWindow.webContents.openDevTools({ mode: "detach" });
  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
  } else if (!app.isPackaged) {
    mainWindow.loadURL("http://localhost:5173/");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  mainWindow.webContents.on("did-finish-load", async () => {
    console.log("Renderer URL:", mainWindow.webContents.getURL());
    if (!app.isPackaged) {
      try {
        await mainWindow.webContents.session.clearCache();
      } catch (_err) {}
    }
  });
}

function getUserConfigPath() {
  return path.join(app.getPath("userData"), "config.json");
}

function getLegacyConfigPath() {
  return path.join(app.getAppPath(), "config.json");
}

function migrateConfigIfNeeded() {
  const userPath = getUserConfigPath();
  const legacyPath = getLegacyConfigPath();
  try {
    if (!fs.existsSync(userPath) && fs.existsSync(legacyPath)) {
      fs.mkdirSync(path.dirname(userPath), { recursive: true });
      fs.copyFileSync(legacyPath, userPath);
    }
  } catch (err) {
    console.error("Config migration failed:", err);
  }
  return userPath;
}

async function retrieveTokenOnline(statusCb) {
  const { codeVerifier, codeChallenge } = createPkce();
  const authUrl =
    "https://streamlabs.com/slobs/login?" +
    "skip_splash=true&external=electron&tiktok=&force_verify=&origin=slobs" +
    `&code_challenge=${encodeRFC3986(codeChallenge)}` +
    "&code_flow=true";

  if (statusCb) statusCb("Opening Chrome...");
  const code = await retrieveCodeWithSelenium(authUrl, null, { keepOpenOnError: true });
  if (!code) {
    if (statusCb) statusCb("Login timeout.");
    return { token: null, error: "Timed out waiting for login (Selenium)." };
  }
  try {
    if (statusCb) statusCb("Exchanging token...");
    await new Promise((r) => setTimeout(r, 5000));
    const token = await exchangeCode(code, codeVerifier, fetch, {
      timeoutMs: 20000,
      retries: 2,
      retryStatuses: [401, 429, 500, 502, 503, 504],
      retryDelayMs: 2000,
      headers: {
        "user-agent": AUTH_UA
      }
    });
    if (!token) {
      if (statusCb) statusCb("Exchange failed.");
      return { token: null, error: "Failed to obtain token online (Selenium)." };
    }
    if (statusCb) statusCb("Token received.");
    return { token, error: null };
  } catch (err) {
    if (statusCb) statusCb("Token request failed.");
    const message = String(err || "");
    if (message.includes("UND_ERR_CONNECT_TIMEOUT")) {
      return { token: null, error: "Streamlabs token request timed out. Please try again." };
    }
    return { token: null, error: `Token request failed: ${message}` };
  }
}

app.whenReady().then(() => {
  createMainWindow();

  app.on("browser-window-created", (_event, win) => {
    win.webContents.on("before-input-event", (event, input) => {
      const key = String(input.key || "").toLowerCase();
      const isOpenDevTools =
        (input.control || input.meta) && input.shift && key === "i";
      if (isOpenDevTools || key === "f12") {
        win.webContents.openDevTools({ mode: "detach" });
        event.preventDefault();
      }
    });
  });

  setTimeout(async () => {
    const { version } = require("../../package.json");
    const info = await checkUpdate("Loukious/StreamlabsTikTokStreamKeyGenerator", version);
    if (info) {
      pendingUpdateInfo = info;
      if (mainWindow) {
        mainWindow.webContents.send("update:available", info);
      }
    }
  }, 6000);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("config:load", async () => {
  const pathToConfig = migrateConfigIfNeeded();
  return loadConfig(pathToConfig);
});

ipcMain.handle("config:save", async (_event, data) => {
  const pathToConfig = migrateConfigIfNeeded();
  saveConfig(pathToConfig, data || {});
  return { ok: true };
});

ipcMain.handle("token:loadLocal", async () => {
  return tokenService.loadLocalToken();
});

ipcMain.handle("token:loadWeb", async (event) => {
  return retrieveTokenOnline((status) => {
    try {
      event.sender.send("token:status", status);
    } catch (_err) {}
  });
});

ipcMain.handle("stream:setToken", async (_event, token) => {
  streamService.setToken(token || "");
  return { ok: true };
});

ipcMain.handle("stream:setStreamId", async (_event, streamId) => {
  streamService.setStreamId(streamId || null);
  return { ok: true };
});

ipcMain.handle("stream:info", async () => {
  try {
    const info = await streamService.getInfo();
    return { ok: true, info };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
});

ipcMain.handle("stream:search", async (_event, query) => {
  try {
    const categories = await streamService.search(query || "");
    return { ok: true, categories };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
});

ipcMain.handle("stream:start", async (_event, payload) => {
  try {
    const { title, category, audienceType } = payload || {};
    const result = await streamService.start(title || "", category || "", audienceType || "0");
    return { ok: true, result };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
});

ipcMain.handle("stream:end", async () => {
  try {
    const ok = await streamService.end();
    return { ok };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
});

ipcMain.handle("shell:openExternal", async (_event, url) => {
  if (url) {
    await shell.openExternal(url);
  }
  return { ok: true };
});

ipcMain.handle("window:minimize", async () => {
  if (mainWindow) mainWindow.minimize();
  return { ok: true };
});

ipcMain.handle("window:maximize", async () => {
  if (!mainWindow) return { ok: false };
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
  return { ok: true };
});

ipcMain.handle("window:close", async () => {
  if (mainWindow) mainWindow.close();
  return { ok: true };
});

ipcMain.handle("renderer:ready", async () => {
  if (pendingUpdateInfo && mainWindow) {
    mainWindow.webContents.send("update:available", pendingUpdateInfo);
  }
  return { ok: true };
});
