import { useEffect } from "react"
import type { LogLevel, ModalButton, ToastType } from "../shared/domain/app"
import { useApiBridge } from "./useApiBridge"
import { useCoreStore, useLogsStore } from "../stores"

type UseAppEventListenersDeps = {
  t: (key: string) => string
  showModal: (title: string, body: string, buttons?: ModalButton[]) => Promise<{ value: string }>
  pushToast: (message: string, type?: ToastType, duration?: number) => void
  pushStatus: (message: string, level?: LogLevel) => void
}

export const useAppEventListeners = ({
  t,
  showModal,
  pushToast,
  pushStatus
}: UseAppEventListenersDeps): void => {
  const api = useApiBridge()
  const setUpdateProgress = useCoreStore((state) => state.setUpdateProgress)
  const setLoadingMessage = useCoreStore((state) => state.setLoadingMessage)
  const appendSystemLog = useLogsStore((state) => state.appendSystemLog)
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
      appendSystemLog(entry)
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
    appendSystemLog,
    pushStatus,
    pushToast,
    setLoadingMessage,
    setUpdateProgress,
    showModal,
    t
  ])
}
