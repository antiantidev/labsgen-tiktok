import { create } from "zustand"

type DashboardPerformanceState = {
  cpuPercent: number | null
  memPercent: number | null
  memUsedMB: number
  memTotalMB: number
}

type DashboardStore = {
  performance: DashboardPerformanceState
  perfLoading: boolean
  setPerformance: (value: DashboardPerformanceState) => void
  setPerfLoading: (value: boolean) => void
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  performance: {
    cpuPercent: null,
    memPercent: null,
    memUsedMB: 0,
    memTotalMB: 0
  },
  perfLoading: true,
  setPerformance: (value) => set({ performance: value }),
  setPerfLoading: (value) => set({ perfLoading: value })
}))

