import { useEffect, useMemo } from "react"
import { useApiBridge } from "../useApiBridge"
import { useDashboardStore } from "../../stores"

type DashboardPerformanceState = {
  cpuPercent: number | null
  memPercent: number | null
  memUsedMB: number
  memTotalMB: number
}

type UseDashboardPerformanceResult = {
  performance: DashboardPerformanceState
  perfLoading: boolean
  memLabel: string
}

export const useDashboardPerformance = (): UseDashboardPerformanceResult => {
  const api = useApiBridge()
  const performance = useDashboardStore((state) => state.performance)
  const setPerformance = useDashboardStore((state) => state.setPerformance)
  const perfLoading = useDashboardStore((state) => state.perfLoading)
  const setPerfLoading = useDashboardStore((state) => state.setPerfLoading)

  useEffect(() => {
    let isMounted = true
    let intervalId: ReturnType<typeof setInterval> | null = null

    const fetchPerformance = async () => {
      try {
        const res = await api.getPerformance()
        if (!isMounted || !res || !res.ok) return
        setPerformance({
          cpuPercent: res.cpuPercent,
          memPercent: res.memPercent,
          memUsedMB: res.memUsedMB,
          memTotalMB: res.memTotalMB
        })
        setPerfLoading(false)
      } catch {
        // Ignore transient polling errors and keep last known values.
      }
    }

    void fetchPerformance()
    intervalId = setInterval(() => {
      void fetchPerformance()
    }, 2000)

    return () => {
      isMounted = false
      if (intervalId) clearInterval(intervalId)
    }
  }, [api])

  const memLabel = useMemo(() => {
    if (!performance.memTotalMB) return "--"
    const used = performance.memUsedMB.toFixed(0)
    const total = performance.memTotalMB.toFixed(0)
    return `${used} / ${total} MB`
  }, [performance.memUsedMB, performance.memTotalMB])

  return {
    performance,
    perfLoading,
    memLabel
  }
}
