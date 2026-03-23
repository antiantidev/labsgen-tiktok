import type { App } from "electron"
import { join } from "node:path"

export const APP_USER_MODEL_ID = "com.labsgen-tiktok.app"
export const LOG_RETENTION = 5000
export const APP_USER_DATA_DIR_NAME = "Labsgen Tiktok"
export const PROFILES_DIR_NAME = "profiles"

export function initializeRuntimePaths(app: App): { userDataPath: string; defaultProfilesDir: string } {
  const userDataPath = join(app.getPath("appData"), APP_USER_DATA_DIR_NAME)
  app.setPath("userData", userDataPath)
  return {
    userDataPath,
    defaultProfilesDir: join(userDataPath, PROFILES_DIR_NAME)
  }
}
