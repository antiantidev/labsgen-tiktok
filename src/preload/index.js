import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  loadConfig: () => ipcRenderer.invoke("config:load"),
  saveConfig: (data) => ipcRenderer.invoke("config:save", data),
  loadLocalToken: () => ipcRenderer.invoke("token:loadLocal"),
  loadWebToken: () => ipcRenderer.invoke("token:loadWeb"),
  setToken: (token) => ipcRenderer.invoke("stream:setToken", token),
  refreshAccount: () => ipcRenderer.invoke("stream:info"),
  searchGames: (query) => ipcRenderer.invoke("stream:search", query),
  startStream: (payload) => ipcRenderer.invoke("stream:start", payload),
  endStream: () => ipcRenderer.invoke("stream:end"),
  openExternal: (url) => ipcRenderer.invoke("shell:openExternal", url),
  windowMinimize: () => ipcRenderer.invoke("window:minimize"),
  windowMaximize: () => ipcRenderer.invoke("window:maximize"),
  windowClose: () => ipcRenderer.invoke("window:close"),
  setStreamId: (id) => ipcRenderer.invoke("stream:setStreamId", id),
  rendererReady: () => ipcRenderer.invoke("renderer:ready"),
  onTokenStatus: (cb) =>
    ipcRenderer.on("token:status", (_event, status) => cb(status)),
  onUpdateAvailable: (cb) =>
    ipcRenderer.on("update:available", (_event, info) => cb(info))
});
