import type { AppSettings, AppState, PageId, ThemeMode } from "./app"

export type AppLanguage = "en" | "vi"

type BuildPersistedAppStateInput = {
  title: string
  game: string
  gameMaskId: string
  mature: boolean
  token: string
  streamId: string | null
  theme: ThemeMode
  language: string
  activeAccountId: string | null
  settings: AppSettings
  lastPage: PageId
}

export type HydratedAppState = {
  settings?: AppSettings
  activeAccountId?: string | null
  lastPage?: PageId
  theme?: ThemeMode
  language: AppLanguage
  title?: string
  game?: string
  gameMaskId?: string
  mature?: boolean
  token?: string
}

const PAGE_IDS: PageId[] = ["home", "console", "setup", "tokens", "status", "settings"]

function isPageId(value: string): value is PageId {
  return PAGE_IDS.includes(value as PageId)
}

function isThemeMode(value: string): value is ThemeMode {
  return value === "dark" || value === "light"
}

function resolveLanguage(language?: string): AppLanguage {
  return language === "vi" || language === "en" ? language : "en"
}

export function buildPersistedAppState(input: BuildPersistedAppStateInput): AppState {
  return {
    title: input.title,
    game: input.game,
    audience_type: input.mature ? "1" : "0",
    token: input.token,
    stream_id: input.streamId,
    theme: input.theme,
    language: input.language,
    activeAccountId: input.activeAccountId,
    settings: input.settings,
    lastPage: input.lastPage,
    game_mask_id: input.gameMaskId
  }
}

export function hydrateAppState(state: AppState | null): HydratedAppState {
  if (!state) {
    return { language: "en" }
  }

  return {
    settings: state.settings,
    activeAccountId: state.activeAccountId,
    lastPage: state.lastPage && isPageId(state.lastPage) ? state.lastPage : undefined,
    theme: state.theme && isThemeMode(state.theme) ? state.theme : undefined,
    language: resolveLanguage(state.language),
    title: state.title,
    game: state.game,
    gameMaskId: state.game_mask_id,
    mature: state.audience_type ? state.audience_type === "1" : undefined,
    token: state.token
  }
}
