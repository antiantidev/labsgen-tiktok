import type { ThemeMode } from "../../../shared/domain/app"
import type { AppRouteContentProps } from "../routes"
import type { ModalViewState } from "./modal"
import type { SidebarViewProps } from "./sidebar"
import type { ToastViewItem } from "./toast"

export type AppOrchestratorViewModel = {
  isLoading: boolean
  loadingMessage: string
  loadProgress: number
  toasts: ToastViewItem[]
  dismissToast: (id: number) => void
  sidebarProps: SidebarViewProps
  routeContentProps: AppRouteContentProps
  modal: ModalViewState
  theme: ThemeMode
  closeModal: (value: string) => void
}

