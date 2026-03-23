import type { ModalButton } from "../shared/domain/app"
import type { ModalViewState, ToastViewItem } from "../app/types"
import { useUiStore } from "../stores"

type UseUiFeedbackResult = {
  toasts: ToastViewItem[]
  modal: ModalViewState
  pushToast: (message: string, type?: string, duration?: number) => void
  dismissToast: (id: number) => void
  showModal: (title: string, body: string, buttons?: ModalButton[]) => Promise<{ value: string }>
  closeModal: (value: string) => void
}

export const useUiFeedback = (): UseUiFeedbackResult => {
  const toasts = useUiStore((state) => state.toasts)
  const modal = useUiStore((state) => state.modal)
  const pushToast = useUiStore((state) => state.pushToast)
  const dismissToast = useUiStore((state) => state.dismissToast)
  const showModal = useUiStore((state) => state.showModal)
  const closeModal = useUiStore((state) => state.closeModal)

  return {
    toasts,
    modal,
    pushToast,
    dismissToast,
    showModal,
    closeModal
  }
}
