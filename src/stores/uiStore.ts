import { create } from "zustand"
import type { ModalButton, ToastType } from "../shared/domain/app"
import type { ModalViewState, ToastViewItem } from "../app/types"

type UiStore = {
  toasts: ToastViewItem[]
  modal: ModalViewState
  pushToast: (message: string, type?: string, duration?: number) => void
  dismissToast: (id: number) => void
  showModal: (title: string, body: string, buttons?: ModalButton[]) => Promise<{ value: string }>
  closeModal: (value: string) => void
}

const DEFAULT_MODAL: ModalViewState = {
  show: false,
  title: "",
  body: "",
  buttons: [],
  resolve: null
}

export const useUiStore = create<UiStore>((set) => ({
  toasts: [],
  modal: DEFAULT_MODAL,
  pushToast: (message, type = "info", duration = 4000) => {
    const id = Date.now()
    const normalizedType: ToastType =
      type === "success" || type === "warn" || type === "error" ? type : "info"
    set((state) => ({ toasts: [...state.toasts, { id, message, type: normalizedType }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((entry) => entry.id !== id) }))
    }, duration)
  },
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((entry) => entry.id !== id) })),
  showModal: (title, body, buttons = [{ label: "OK", value: "ok", primary: true }]) =>
    new Promise<{ value: string }>((resolve) =>
      set({
        modal: {
          show: true,
          title,
          body,
          buttons,
          resolve
        }
      })
    ),
  closeModal: (value) =>
    set((state) => {
      if (state.modal.resolve) state.modal.resolve({ value })
      return {
        modal: {
          ...state.modal,
          show: false,
          resolve: null
        }
      }
    })
}))

