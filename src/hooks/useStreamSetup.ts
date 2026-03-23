import { useCallback, useRef, useState } from "react"
import type { Dispatch, SetStateAction } from "react"
import type { StreamCategory } from "../shared/ipc/contracts"
import type { StreamDataState, ToastType } from "../shared/domain/app"
import { useApiBridge } from "./useApiBridge"

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
  const [streamTitle, setStreamTitle] = useState("")
  const [gameCategory, setGameCategory] = useState("")
  const [gameMaskId, setGameMaskId] = useState("")
  const [mature, setMature] = useState(false)
  const [streamData, setStreamData] = useState<StreamDataState>({
    url: "",
    key: "",
    id: null,
    isLive: false
  })
  const [suggestions, setSuggestions] = useState<StreamCategory[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestSearch = useRef("")

  const handleSearch = useCallback(
    (text: string) => {
      setGameCategory(text)
      setGameMaskId("")
      if (!text || !token) {
        setSuggestions([])
        return
      }

      if (searchTimer.current) clearTimeout(searchTimer.current)
      latestSearch.current = text
      searchTimer.current = setTimeout(async () => {
        const res = await api.searchGames(text)
        if (res.ok && latestSearch.current === text) {
          setSuggestions(res.categories || [])
          setShowSuggestions(true)
        }
      }, 250)
    },
    [token]
  )

  const startStream = useCallback(async (): Promise<void> => {
    let finalMaskId = gameMaskId
    if (!finalMaskId && gameCategory) {
      const match = await api.getCategoryByName(gameCategory)
      if (match) finalMaskId = match.game_mask_id || ""
    }
    if (!finalMaskId) {
      pushToast(t("setup.invalid_category"), "error")
      return
    }
    const res = await api.startStream({
      title: streamTitle,
      category: finalMaskId,
      audienceType: mature ? "1" : "0"
    })
    if (res.ok) {
      const streamResult = res.result || { streamUrl: null, streamKey: null, streamId: null }
      setStreamData({
        url: streamResult.streamUrl || "",
        key: streamResult.streamKey || "",
        id: streamResult.streamId || streamData.id,
        isLive: true
      })
      pushToast("Broadcast is now ONLINE", "success")
    } else {
      pushToast(res.error || t("common.error"), "error")
    }
  }, [gameCategory, gameMaskId, mature, pushToast, streamData.id, streamTitle, t])

  const endStream = useCallback(async (): Promise<void> => {
    const res = await api.endStream()
    if (res.ok) {
      setStreamData({ url: "", key: "", id: null, isLive: false })
      pushToast("Broadcast ended", "info")
    } else {
      pushToast("Could not end session", "error")
    }
  }, [pushToast])

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
