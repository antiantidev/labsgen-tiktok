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
  loadWebToken: () => ipcRenderer.invoke("load-web-token"),
  
  windowMinimize: () => ipcRenderer.send("window-minimize"),
  windowMaximize: () => ipcRenderer.send("window-maximize"),
  windowClose: () => ipcRenderer.send("window-close"),
  openExternal: (url) => ipcRenderer.send("open-external", url),
  rendererReady: () => ipcRenderer.send("renderer-ready"),
  
  onTokenStatus: (callback) => ipcRenderer.on("token-status", (_, status) => callback(status)),
  
  // Update APIs
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  onUpdateAvailable: (callback) => ipcRenderer.on("update-available", (_, info) => callback(info)),
  onUpdateDownloaded: (callback) => ipcRenderer.on("update-downloaded", () => callback()),
  onUpdateError: (callback) => ipcRenderer.on("update-error", (_, err) => callback(err)),
  startDownload: () => ipcRenderer.send("start-download"),
  quitAndInstall: () => ipcRenderer.send("quit-and-install")
});