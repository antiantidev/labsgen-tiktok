export const APP_SETTING_KEYS = {
  APP_STATE: "app_state"
} as const

export type AppSettingKey = (typeof APP_SETTING_KEYS)[keyof typeof APP_SETTING_KEYS]
