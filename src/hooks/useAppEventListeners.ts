import { useEffect } from "react"
import type { Dispatch, SetStateAction } from "react"
import type { LogLevel, ModalButton, ToastType, UpdateProgress } from "../shared/domain/app"
import type { AppLogEntry } from "../app/types"
import { useApiBridge } from "./useApiBridge"

type UseAppEventListenersDeps = {
  t: (key: string) => string
  showModal: (title: string, body: string, buttons?: ModalButton[]) => Promise<{ value: string }>
  pushToast: (message: string, type?: ToastType, duration?: number) => void
  pushStatus: (message: string, level?: LogLevel) => void
  logPage: number
  logPageSize: number
  setUpdateProgress: Dispatch<SetStateAction<UpdateProgress | null>>
  setLoadingMessage: Dispatch<SetStateAction<string>>
  setLogTotal: Dispatch<SetStateAction<number>>
  setStatusLog: Dispatch<SetStateAction<AppLogEntry[]>>
}

const normalizeLogLevel = (level?: string): LogLevel => {
  if (level === "error" || level === "warn" || level === "success") return level
  return "info"
}

export const useAppEventListeners = ({
  t,
  showModal,
  pushToast,
  pushStatus,
  logPage,
  logPageSize,
  setUpdateProgress,
  setLoadingMessage,
  setLogTotal,
  setStatusLog
}: UseAppEventListenersDeps): void => {
  const api = useApiBridge()
  useEffect(() => {
    const cu = api.onUpdateAvailable((info) =>
      showModal(t("update.available"), `${t("update.desc")} (${info.latest}).`, [
        { label: t("update.now"), value: "download", primary: true },
        { label: t("update.later"), value: "cancel", primary: false }
      ]).then((response) => {
        if (response.value === "download") api.startDownload()
      })
    )
    const cd = api.onUpdateDownloaded(() => {
      setUpdateProgress(null)
      void showModal(t("update.ready"), t("update.ready_desc"), [
        { label: t("update.restart"), value: "install", primary: true },
        { label: t("update.later"), value: "cancel", primary: false }
      ]).then((response) => {
        if (response.value === "install") api.quitAndInstall()
      })
    })
    const ce = api.onUpdateError(() => {
      setUpdateProgress(null)
      pushToast(t("update.fetch_failed"), "error")
    })
    const cp = api.onUpdateProgress((progress) => {
      if (progress && typeof progress.percent === "number") setUpdateProgress({ percent: progress.percent })
    })
    const ct = api.onTokenStatus((message) => {
      setLoadingMessage(message)
      pushStatus(`Web: ${message}`, "info")
    })
    const cl = api.onSystemLog((entry) => {
      if (!entry) return
      setLogTotal((prev) => prev + 1)
      if (logPage === 1) {
        setStatusLog((prev) =>
          [
            {
              id: entry.id || Date.now(),
              level: normalizeLogLevel(entry.level),
              message: entry.message || "",
              timestamp: entry.timestamp || new Date().toISOString(),
              time: new Date(entry.timestamp || Date.now()).toLocaleTimeString()
            },
            ...prev
          ].slice(0, logPageSize)
        )
      }
    })
    return () => {
      cu()
      cd()
      ce()
      cp()
      ct()
      cl()
    }
  }, [
    logPage,
    logPageSize,
    pushStatus,
    pushToast,
    setLoadingMessage,
    setLogTotal,
    setStatusLog,
    setUpdateProgress,
    showModal,
    t
  ])
}
