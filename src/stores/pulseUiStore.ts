import { create } from "zustand"
import type { PulseLogLevel } from "../app/types"

type PulseFilter = "all" | PulseLogLevel

type PulseUiStore = {
  filter: PulseFilter
  search: string
  setFilter: (value: PulseFilter) => void
  setSearch: (value: string) => void
}

export const usePulseUiStore = create<PulseUiStore>((set) => ({
  filter: "all",
  search: "",
  setFilter: (value) => set({ filter: value }),
  setSearch: (value) => set({ search: value })
}))

