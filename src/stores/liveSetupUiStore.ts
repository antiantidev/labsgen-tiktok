import { create } from "zustand"

type LiveSetupUiStore = {
  isSyncing: boolean
  localCount: number
  setIsSyncing: (value: boolean) => void
  setLocalCount: (value: number) => void
}

export const useLiveSetupUiStore = create<LiveSetupUiStore>((set) => ({
  isSyncing: false,
  localCount: 0,
  setIsSyncing: (value) => set({ isSyncing: value }),
  setLocalCount: (value) => set({ localCount: value })
}))

