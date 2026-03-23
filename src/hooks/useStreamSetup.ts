import { useCallback } from "react"
import type { Dispatch, SetStateAction } from "react"
import type { StreamCategory } from "../shared/ipc/contracts"
import type { StreamDataState, ToastType } from "../shared/domain/app"
import { useApiBridge } from "./useApiBridge"
import { useStreamStore } from "../stores"

type UseStreamSetupDeps = {
  t: (key: string) => string
  token: string
  pushToast: (message: string, type?: ToastType, duration?: number) => void
}

type UseStreamSetupResult = {
  streamTitle: string
  setStreamTitle: Dispatch<SetStateAction<string>>
  gameCategory: string
  setGameCategory: Dispatch<SetStateAction<string>>
  gameMaskId: string
  setGameMaskId: Dispatch<SetStateAction<string>>
  mature: boolean
  setMature: Dispatch<SetStateAction<boolean>>
  streamData: StreamDataState
  suggestions: StreamCategory[]
  showSuggestions: boolean
  setShowSuggestions: Dispatch<SetStateAction<boolean>>
  handleSearch: (text: string) => void
  startStream: () => Promise<void>
  endStream: () => Promise<void>
}

export const useStreamSetup = ({ t, token, pushToast }: UseStreamSetupDeps): UseStreamSetupResult => {
  const api = useApiBridge()
  const streamTitle = useStreamStore((state) => state.streamTitle)
  const setStreamTitle = useStreamStore((state) => state.setStreamTitle)
  const gameCategory = useStreamStore((state) => state.gameCategory)
  const setGameCategory = useStreamStore((state) => state.setGameCategory)
  const gameMaskId = useStreamStore((state) => state.gameMaskId)
  const setGameMaskId = useStreamStore((state) => state.setGameMaskId)
  const mature = useStreamStore((state) => state.mature)
  const setMature = useStreamStore((state) => state.setMature)
  const streamData = useStreamStore((state) => state.streamData)
  const suggestions = useStreamStore((state) => state.suggestions)
  const showSuggestions = useStreamStore((state) => state.showSuggestions)
  const setShowSuggestions = useStreamStore((state) => state.setShowSuggestions)
  const handleSearchAction = useStreamStore((state) => state.handleSearch)
  const startStreamAction = useStreamStore((state) => state.startStream)
  const endStreamAction = useStreamStore((state) => state.endStream)

  const handleSearch = useCallback((text: string) => {
    handleSearchAction(api, text, token)
  }, [api, handleSearchAction, token])

  const startStream = useCallback(async (): Promise<void> => {
    await startStreamAction({ api, t, token, pushToast })
  }, [api, pushToast, startStreamAction, t, token])

  const endStream = useCallback(async (): Promise<void> => {
    await endStreamAction({ api, pushToast })
  }, [api, endStreamAction, pushToast])

  return {
    streamTitle,
    setStreamTitle,
    gameCategory,
    setGameCategory,
    gameMaskId,
    setGameMaskId,
    mature,
    setMature,
    streamData,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    handleSearch,
    startStream,
    endStream
  }
}
