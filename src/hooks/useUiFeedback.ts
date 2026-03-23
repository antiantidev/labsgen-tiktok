import { useCallback, useState } from "react"
import type { ModalButton, ToastType } from "../shared/domain/app"
import type { ModalViewState, ToastViewItem } from "../app/types"

type UseUiFeedbackResult = {
  toasts: ToastViewItem[]
  modal: ModalViewState
  pushToast: (message: string, type?: string, duration?: number) => void
  dismissToast: (id: number) => void
  showModal: (title: string, body: string, buttons?: ModalButton[]) => Promise<{ value: string }>
  closeModal: (value: string) => void
}

export const useUiFeedback = (): UseUiFeedbackResult => {
  const [toasts, setToasts] = useState<ToastViewItem[]>([])
  const [modal, setModal] = useState<ModalViewState>({
    show: false,
    title: "",
    body: "",
    buttons: [],
    resolve: null
  })

  const pushToast = useCallback((message: string, type = "info", duration = 4000) => {
    const id = Date.now()
    const normalizedType: ToastType =
      type === "success" || type === "warn" || type === "error" ? type : "info"
    setToasts((prev) => [...prev, { id, message, type: normalizedType }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((entry) => entry.id !== id))
    }, duration)
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((entry) => entry.id !== id))
  }, [])

  const showModal = useCallback(
    (title: string, body: string, buttons: ModalButton[] = [{ label: "OK", value: "ok", primary: true }]) =>
      new Promise<{ value: string }>((resolve) => setModal({ show: true, title, body, buttons, resolve })),
    []
  )

  const closeModal = useCallback((value: string) => {
    setModal((prev) => {
      if (prev.resolve) prev.resolve({ value })
      return { ...prev, show: false, resolve: null }
    })
  }, [])

  return {
    toasts,
    modal,
    pushToast,
    dismissToast,
    showModal,
    closeModal
  }
}
