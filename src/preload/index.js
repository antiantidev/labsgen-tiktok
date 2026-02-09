const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  loadConfig: () => ipcRenderer.invoke("load-config"),
  saveConfig: (data) => ipcRenderer.invoke("save-config", data),
  setToken: (token) => ipcRenderer.invoke("set-token", token),
  refreshAccount: () => ipcRenderer.invoke("refresh-account"),
  searchGames: (text) => ipcRenderer.invoke("search-games", text),
  startStream: (data) => ipcRenderer.invoke("start-stream", data),
  endStream: () => ipcRenderer.invoke("end-stream"),
  setStreamId: (id) => ipcRenderer.invoke("set-stream-id", id),
  loadLocalToken: () => ipcRenderer.invoke("load-local-token"),
  loadWebToken: (options) => ipcRenderer.invoke("load-web-token", options),
  
  windowMinimize: () => ipcRenderer.send("window-minimize"),
  windowMaximize: () => ipcRenderer.send("window-maximize"),
  windowClose: () => ipcRenderer.send("window-close"),
  openExternal: (url) => ipcRenderer.send("open-external", url),
  rendererReady: () => ipcRenderer.send("renderer-ready"),
  selectFolder: () => ipcRenderer.invoke("select-folder"),
  openPath: (path) => ipcRenderer.invoke("open-path", path),
  getDefaultPath: () => ipcRenderer.invoke("get-default-path"),
  getAllPaths: () => ipcRenderer.invoke("get-all-paths"),
  checkDriverExists: () => ipcRenderer.invoke("check-driver-exists"),
  bootstrapDriver: () => ipcRenderer.invoke("bootstrap-driver"),
  deleteProfile: (accountId) => ipcRenderer.invoke("delete-profile", accountId),

  // Database APIs
  getAccounts: () => ipcRenderer.invoke("db-get-accounts"),
  saveAccount: (acc) => ipcRenderer.invoke("db-save-account", acc),
  updateUsername: (id, username) => ipcRenderer.invoke("db-update-username", { id, username }),
  deleteAccount: (id) => ipcRenderer.invoke("db-delete-account", id),
  getSetting: (key, defaultValue) => ipcRenderer.invoke("db-get-setting", key, defaultValue),
  saveSetting: (key, value) => ipcRenderer.invoke("db-save-setting", key, value),
  syncCategories: () => ipcRenderer.invoke("sync-categories"),
  getCategoryCount: () => ipcRenderer.invoke("get-category-count"),
  getCategoryByName: (name) => ipcRenderer.invoke("get-category-by-name", name),
  
  onTokenStatus: (callback) => {
    const subscription = (_, status) => callback(status);
    ipcRenderer.on("token-status", subscription);
    return () => ipcRenderer.removeListener("token-status", subscription);
  },
  
  // Update APIs
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  onUpdateAvailable: (callback) => {
    const subscription = (_, info) => callback(info);
    ipcRenderer.on("update-available", subscription);
    return () => ipcRenderer.removeListener("update-available", subscription);
  },
  onUpdateDownloaded: (callback) => {
    const subscription = () => callback();
    ipcRenderer.on("update-downloaded", subscription);
    return () => ipcRenderer.removeListener("update-downloaded", subscription);
  },
  onUpdateError: (callback) => {
    const subscription = (_, err) => callback(err);
    ipcRenderer.on("update-error", subscription);
    return () => ipcRenderer.removeListener("update-error", subscription);
  },
  startDownload: () => ipcRenderer.send("start-download"),
  quitAndInstall: () => ipcRenderer.send("quit-and-install"),
  checkForUpdates: () => ipcRenderer.invoke("check-for-updates")
});