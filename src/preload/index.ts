import { contextBridge } from "electron"
import type { ApiBridge } from "../shared/ipc/contracts"
import { IPC_CHANNELS } from "../shared/ipc/channels"
import { invokeIpc, onIpc, sendIpc } from "./ipcClient"
import type { AppPersistedSettingsMap } from "../shared/domain/app"

function getSetting<K extends keyof AppPersistedSettingsMap>(key: K, defaultValue: AppPersistedSettingsMap[K]): Promise<AppPersistedSettingsMap[K]>
function getSetting<K extends keyof AppPersistedSettingsMap>(key: K, defaultValue?: AppPersistedSettingsMap[K]): Promise<AppPersistedSettingsMap[K] | null>
function getSetting<T = unknown>(key: string, defaultValue: T): Promise<T>
function getSetting<T = unknown>(key: string, defaultValue?: T): Promise<T | null>
function getSetting(key: string, defaultValue?: unknown): Promise<unknown> {
  return invokeIpc(IPC_CHANNELS.DB_GET_SETTING, key, defaultValue)
}

function saveSetting<K extends keyof AppPersistedSettingsMap>(key: K, value: AppPersistedSettingsMap[K]): Promise<unknown>
function saveSetting(key: string, value: unknown): Promise<unknown>
function saveSetting(key: string, value: unknown): Promise<unknown> {
  return invokeIpc(IPC_CHANNELS.DB_SAVE_SETTING, key, value)
}

const api: ApiBridge = {
  setToken: (token) => invokeIpc(IPC_CHANNELS.SET_TOKEN, token),
  refreshAccount: () => invokeIpc(IPC_CHANNELS.REFRESH_ACCOUNT),
  searchGames: (text) => invokeIpc(IPC_CHANNELS.SEARCH_GAMES, text),
  startStream: (data) => invokeIpc(IPC_CHANNELS.START_STREAM, data),
  endStream: () => invokeIpc(IPC_CHANNELS.END_STREAM),
  setStreamId: (id) => invokeIpc(IPC_CHANNELS.SET_STREAM_ID, id),
  loadLocalToken: () => invokeIpc(IPC_CHANNELS.LOAD_LOCAL_TOKEN),
  loadWebToken: (options) => invokeIpc(IPC_CHANNELS.LOAD_WEB_TOKEN, options),
  
  windowMinimize: () => sendIpc(IPC_CHANNELS.WINDOW_MINIMIZE),
  windowMaximize: () => sendIpc(IPC_CHANNELS.WINDOW_MAXIMIZE),
  windowClose: () => sendIpc(IPC_CHANNELS.WINDOW_CLOSE),
  openExternal: (url) => sendIpc(IPC_CHANNELS.OPEN_EXTERNAL, url),
  rendererReady: () => sendIpc(IPC_CHANNELS.RENDERER_READY),
  selectFolder: () => invokeIpc(IPC_CHANNELS.SELECT_FOLDER),
  openPath: (path) => invokeIpc(IPC_CHANNELS.OPEN_PATH, path),
  getDefaultPath: () => invokeIpc(IPC_CHANNELS.GET_DEFAULT_PATH),
  getAllPaths: () => invokeIpc(IPC_CHANNELS.GET_ALL_PATHS),
  checkDriverExists: () => invokeIpc(IPC_CHANNELS.CHECK_DRIVER_EXISTS),
  bootstrapDriver: () => invokeIpc(IPC_CHANNELS.BOOTSTRAP_DRIVER),
  deleteProfile: (accountId) => invokeIpc(IPC_CHANNELS.DELETE_PROFILE, accountId),
  getPerformance: () => invokeIpc(IPC_CHANNELS.GET_PERFORMANCE),

  // Database APIs
  getAccounts: () => invokeIpc(IPC_CHANNELS.DB_GET_ACCOUNTS),
  saveAccount: (acc) => invokeIpc(IPC_CHANNELS.DB_SAVE_ACCOUNT, acc),
  updateUsername: (id, username) => invokeIpc(IPC_CHANNELS.DB_UPDATE_USERNAME, { id, username }),
  deleteAccount: (id) => invokeIpc(IPC_CHANNELS.DB_DELETE_ACCOUNT, id),
  getSetting,
  saveSetting,
  syncCategories: () => invokeIpc(IPC_CHANNELS.SYNC_CATEGORIES),
  getCategoryCount: () => invokeIpc(IPC_CHANNELS.GET_CATEGORY_COUNT),
  getCategoryByName: (name) => invokeIpc(IPC_CHANNELS.GET_CATEGORY_BY_NAME, name),
  
  onTokenStatus: (callback) => {
    return onIpc(IPC_CHANNELS.TOKEN_STATUS, callback)
  },
  
  // Update APIs
  getAppVersion: () => invokeIpc(IPC_CHANNELS.GET_APP_VERSION),
  onUpdateAvailable: (callback) => {
    return onIpc(IPC_CHANNELS.UPDATE_AVAILABLE, callback)
  },
  onUpdateDownloaded: (callback) => {
    return onIpc(IPC_CHANNELS.UPDATE_DOWNLOADED, () => callback())
  },
  onUpdateError: (callback) => {
    return onIpc(IPC_CHANNELS.UPDATE_ERROR, (payload) => callback(String(payload)))
  },
  onUpdateProgress: (callback) => {
    return onIpc(IPC_CHANNELS.UPDATE_PROGRESS, callback)
  },
  startDownload: () => sendIpc(IPC_CHANNELS.START_DOWNLOAD),
  quitAndInstall: () => sendIpc(IPC_CHANNELS.QUIT_AND_INSTALL),
  checkForUpdates: () => invokeIpc(IPC_CHANNELS.CHECK_FOR_UPDATES),
  addSystemLog: (entry) => invokeIpc(IPC_CHANNELS.SYSTEM_LOG_ADD, entry),
  getSystemLogs: (params) => invokeIpc(IPC_CHANNELS.SYSTEM_LOG_GET, params),
  getSystemLogCount: () => invokeIpc(IPC_CHANNELS.SYSTEM_LOG_COUNT),
  clearSystemLogs: () => invokeIpc(IPC_CHANNELS.SYSTEM_LOG_CLEAR),
  onSystemLog: (callback) => {
    return onIpc(IPC_CHANNELS.SYSTEM_LOG, callback)
  }
}

contextBridge.exposeInMainWorld("api", api)
