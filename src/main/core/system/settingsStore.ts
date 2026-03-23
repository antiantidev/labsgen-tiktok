import type { AppState } from "../../../shared/domain/app"
import { APP_SETTING_KEYS } from "../../../shared/domain/settings"
import type { DBServiceLike } from "../types"

type CreateSettingsStoreDeps = {
  dbService: DBServiceLike
}

export function createSettingsStore({ dbService }: CreateSettingsStoreDeps): {
  getAppState: (defaultValue?: AppState) => AppState
  saveAppState: (value: AppState) => unknown
} {
  const getAppState = (defaultValue: AppState = {}): AppState => {
    return dbService.getSetting<AppState>(APP_SETTING_KEYS.APP_STATE, defaultValue)
  }

  const saveAppState = (value: AppState): unknown => {
    return dbService.saveSetting(APP_SETTING_KEYS.APP_STATE, value)
  }

  return { getAppState, saveAppState }
}
