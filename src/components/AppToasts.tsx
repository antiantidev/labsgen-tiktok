import { Toast, ToastContainer } from "./ui"
import type { ToastViewItem } from "../app/types"

type AppToastsProps = {
  toasts: ToastViewItem[]
  dismissToast: (id: number) => void
}

export const AppToasts = ({ toasts, dismissToast }: AppToastsProps) => {
  return (
    <ToastContainer>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => dismissToast(toast.id)}
        />
      ))}
    </ToastContainer>
  )
}
