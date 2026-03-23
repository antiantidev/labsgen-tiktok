import fs from "node:fs"
import type { AppState } from "../../../shared/domain/app"

type CreateProfilesServiceDeps = {
  defaultProfilesDir: string
  getAppState: (defaultValue?: AppState) => AppState
}

export function createProfilesService({ defaultProfilesDir, getAppState }: CreateProfilesServiceDeps): {
  getProfilesDir: () => string
  ensureProfilesDir: () => void
} {
  const getProfilesDir = (): string => {
    try {
      const state = getAppState({})
      return state.settings?.customProfilePath || defaultProfilesDir
    } catch {
      return defaultProfilesDir
    }
  }

  const ensureProfilesDir = (): void => {
    const dir = getProfilesDir()
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }

  return { getProfilesDir, ensureProfilesDir }
}
