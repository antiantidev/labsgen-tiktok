import { useCallback, useEffect, useRef } from "react"
import type { Dispatch, SetStateAction } from "react"
import type { AppSettings, PageId, ThemeMode, ToastType } from "../shared/domain/app"
import { buildPersistedAppState } from "../shared/domain/appStatePersistence"
import { APP_SETTING_KEYS } from "../shared/domain/settings"
import { useApiBridge } from "./useApiBridge"

type UseAppPersistenceDeps = {
  t: (key: string) => string
  language: string
  isLoading: boolean
  currentPage: PageId
  streamTitle: string
  gameCategory: string
  gameMaskId: string
  mature: boolean
  token: string
  streamId: string | null
  theme: ThemeMode
  activeAccountId: string | null
  settings: AppSettings
  pushToast: (message: string, type?: ToastType, duration?: number) => void
  setGameCategory: Dispatch<SetStateAction<string>>
  setGameMaskId: Dispatch<SetStateAction<string>>
}

type UseAppPersistenceResult = {
  saveConfig: (showMessage?: boolean) => Promise<boolean>
}

export const useAppPersistence = ({
  t,
  language,
  isLoading,
  currentPage,
  streamTitle,
  gameCategory,
  gameMaskId,
  mature,
  token,
  streamId,
  theme,
  activeAccountId,
  settings,
  pushToast,
  setGameCategory,
  setGameMaskId
}: UseAppPersistenceDeps): UseAppPersistenceResult => {
  const api = useApiBridge()
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const saveConfig = useCallback(
    async (showMessage = false): Promise<boolean> => {
      let finalCategory = gameCategory
      let finalMaskId = gameMaskId
      if (gameCategory && !gameMaskId) {
        const match = await api.getCategoryByName(gameCategory)
        if (match) {
          finalCategory = match.full_name || gameCategory
          finalMaskId = match.game_mask_id || ""
          setGameCategory(finalCategory)
          setGameMaskId(finalMaskId)
        } else if (showMessage) {
          pushToast(t("setup.invalid_category"), "error")
          return false
        }
      }

      const appState = buildPersistedAppState({
        title: streamTitle,
        game: finalCategory,
        gameMaskId: finalMaskId,
        mature,
        token,
        streamId,
        theme,
        language,
        activeAccountId,
        settings,
        lastPage: currentPage
      })

      await api.saveSetting(APP_SETTING_KEYS.APP_STATE, appState)
      if (showMessage) pushToast(t("common.save_success"), "success")
      return true
    },
    [
      activeAccountId,
      currentPage,
      gameCategory,
      gameMaskId,
      language,
      mature,
      pushToast,
      settings,
      setGameCategory,
      setGameMaskId,
      streamId,
      streamTitle,
      t,
      theme,
      token
    ]
  )

  useEffect(() => {
    if (!isLoading) void saveConfig(false)
  }, [currentPage, isLoading, saveConfig])

  useEffect(() => {
    if (!isLoading) {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
      autoSaveTimer.current = setTimeout(() => void saveConfig(false), 800)
    }
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
  }, [activeAccountId, gameCategory, isLoading, language, mature, saveConfig, settings, streamTitle, theme, token])

  return { saveConfig }
}
