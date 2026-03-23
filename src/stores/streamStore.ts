import { create } from "zustand"
import type { SetStateAction } from "react"
import type { StreamCategory, ApiBridge } from "../shared/ipc/contracts"
import type { StreamDataState, ToastType } from "../shared/domain/app"
import { resolveStateUpdate } from "./utils"

let searchTimer: ReturnType<typeof setTimeout> | null = null
let latestSearch = ""

type StreamStore = {
  streamTitle: string
  gameCategory: string
  gameMaskId: string
  mature: boolean
  streamData: StreamDataState
  suggestions: StreamCategory[]
  showSuggestions: boolean
  setStreamTitle: (update: SetStateAction<string>) => void
  setGameCategory: (update: SetStateAction<string>) => void
  setGameMaskId: (update: SetStateAction<string>) => void
  setMature: (update: SetStateAction<boolean>) => void
  setShowSuggestions: (update: SetStateAction<boolean>) => void
  handleSearch: (api: ApiBridge, text: string, token: string) => void
  startStream: (params: {
    api: ApiBridge
    t: (key: string) => string
    token: string
    pushToast: (message: string, type?: ToastType, duration?: number) => void
  }) => Promise<void>
  endStream: (params: {
    api: ApiBridge
    pushToast: (message: string, type?: ToastType, duration?: number) => void
  }) => Promise<void>
}

export const useStreamStore = create<StreamStore>((set, get) => ({
  streamTitle: "",
  gameCategory: "",
  gameMaskId: "",
  mature: false,
  streamData: {
    url: "",
    key: "",
    id: null,
    isLive: false
  },
  suggestions: [],
  showSuggestions: false,
  setStreamTitle: (update) => set((state) => ({ streamTitle: resolveStateUpdate(update, state.streamTitle) })),
  setGameCategory: (update) => set((state) => ({ gameCategory: resolveStateUpdate(update, state.gameCategory) })),
  setGameMaskId: (update) => set((state) => ({ gameMaskId: resolveStateUpdate(update, state.gameMaskId) })),
  setMature: (update) => set((state) => ({ mature: resolveStateUpdate(update, state.mature) })),
  setShowSuggestions: (update) => set((state) => ({ showSuggestions: resolveStateUpdate(update, state.showSuggestions) })),

  handleSearch: (api, text, token) => {
    set({
      gameCategory: text,
      gameMaskId: ""
    })
    if (!text || !token) {
      set({ suggestions: [] })
      return
    }

    if (searchTimer) clearTimeout(searchTimer)
    latestSearch = text
    searchTimer = setTimeout(async () => {
      const res = await api.searchGames(text)
      if (res.ok && latestSearch === text) {
        set({
          suggestions: res.categories || [],
          showSuggestions: true
        })
      }
    }, 250)
  },

  startStream: async ({ api, t, token, pushToast }) => {
    if (!token) return
    let finalMaskId = get().gameMaskId
    const category = get().gameCategory
    if (!finalMaskId && category) {
      const match = await api.getCategoryByName(category)
      if (match) finalMaskId = match.game_mask_id || ""
    }

    if (!finalMaskId) {
      pushToast(t("setup.invalid_category"), "error")
      return
    }

    const res = await api.startStream({
      title: get().streamTitle,
      category: finalMaskId,
      audienceType: get().mature ? "1" : "0"
    })

    if (res.ok) {
      const streamResult = res.result || { streamUrl: null, streamKey: null, streamId: null }
      set((state) => ({
        streamData: {
          url: streamResult.streamUrl || "",
          key: streamResult.streamKey || "",
          id: streamResult.streamId || state.streamData.id,
          isLive: true
        }
      }))
      pushToast("Broadcast is now ONLINE", "success")
      return
    }

    pushToast(res.error || t("common.error"), "error")
  },

  endStream: async ({ api, pushToast }) => {
    const res = await api.endStream()
    if (res.ok) {
      set({
        streamData: { url: "", key: "", id: null, isLive: false }
      })
      pushToast("Broadcast ended", "info")
      return
    }
    pushToast("Could not end session", "error")
  }
}))

