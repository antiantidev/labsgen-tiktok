import type { ToastType } from "../../../shared/domain/app"

export type ToastViewItem = {
  id: number
  message: string
  type: ToastType
}

