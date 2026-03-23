import type { Dispatch, SetStateAction } from "react"
import type { StreamCategory } from "../../../shared/ipc/contracts"

export type SetupRouteProps = {
  streamTitle: string
  setStreamTitle: Dispatch<SetStateAction<string>>
  gameCategory: string
  handleSearch: (text: string) => void
  suggestions: StreamCategory[]
  showSuggestions: boolean
  setShowSuggestions: Dispatch<SetStateAction<boolean>>
  setGameCategory: Dispatch<SetStateAction<string>>
  setGameMaskId: Dispatch<SetStateAction<string>>
  mature: boolean
  setMature: Dispatch<SetStateAction<boolean>>
  saveConfig: (showMessage?: boolean) => Promise<boolean>
  gameMaskId: string
  pushToast: (message: string, type?: string, duration?: number) => void
}

