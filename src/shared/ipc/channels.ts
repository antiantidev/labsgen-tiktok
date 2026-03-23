export const IPC_CHANNELS = {
  SET_TOKEN: "set-token",
  REFRESH_ACCOUNT: "refresh-account",
  SEARCH_GAMES: "search-games",
  START_STREAM: "start-stream",
  END_STREAM: "end-stream",
  SET_STREAM_ID: "set-stream-id",
  LOAD_LOCAL_TOKEN: "load-local-token",
  LOAD_WEB_TOKEN: "load-web-token",
  BOOTSTRAP_DRIVER: "bootstrap-driver",
  CHECK_DRIVER_EXISTS: "check-driver-exists",
  DELETE_PROFILE: "delete-profile",

  SELECT_FOLDER: "select-folder",
  OPEN_PATH: "open-path",
  GET_DEFAULT_PATH: "get-default-path",
  GET_ALL_PATHS: "get-all-paths",
  GET_PERFORMANCE: "get-performance",

  DB_GET_ACCOUNTS: "db-get-accounts",
  DB_SAVE_ACCOUNT: "db-save-account",
  DB_UPDATE_USERNAME: "db-update-username",
  DB_DELETE_ACCOUNT: "db-delete-account",
  DB_GET_SETTING: "db-get-setting",
  DB_SAVE_SETTING: "db-save-setting",

  SYNC_CATEGORIES: "sync-categories",
  GET_CATEGORY_COUNT: "get-category-count",
  GET_CATEGORY_BY_NAME: "get-category-by-name",

  WINDOW_MINIMIZE: "window-minimize",
  WINDOW_MAXIMIZE: "window-maximize",
  WINDOW_CLOSE: "window-close",
  OPEN_EXTERNAL: "open-external",
  RENDERER_READY: "renderer-ready",

  TOKEN_STATUS: "token-status",

  START_DOWNLOAD: "start-download",
  QUIT_AND_INSTALL: "quit-and-install",
  GET_APP_VERSION: "get-app-version",
  CHECK_FOR_UPDATES: "check-for-updates",
  UPDATE_AVAILABLE: "update-available",
  UPDATE_DOWNLOADED: "update-downloaded",
  UPDATE_ERROR: "update-error",
  UPDATE_PROGRESS: "update-progress",

  SYSTEM_LOG_ADD: "system-log-add",
  SYSTEM_LOG_GET: "system-log-get",
  SYSTEM_LOG_COUNT: "system-log-count",
  SYSTEM_LOG_CLEAR: "system-log-clear",
  SYSTEM_LOG: "system-log"
} as const

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS]
