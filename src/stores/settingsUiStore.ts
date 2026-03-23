import { create } from "zustand"

type SettingsUiStore = {
  checkingUpdate: boolean
  isInstallingDriver: boolean
  isUpToDate: boolean
  setCheckingUpdate: (value: boolean) => void
  setIsInstallingDriver: (value: boolean) => void
  setIsUpToDate: (value: boolean) => void
}

export const useSettingsUiStore = create<SettingsUiStore>((set) => ({
  checkingUpdate: false,
  isInstallingDriver: false,
  isUpToDate: false,
  setCheckingUpdate: (value) => set({ checkingUpdate: value }),
  setIsInstallingDriver: (value) => set({ isInstallingDriver: value }),
  setIsUpToDate: (value) => set({ isUpToDate: value })
}))

