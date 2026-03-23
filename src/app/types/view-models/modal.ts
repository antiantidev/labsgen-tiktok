import type { ModalButton } from "../../../shared/domain/app"

export type ModalViewState = {
  show: boolean
  title: string
  body: string
  buttons: ModalButton[]
  resolve: ((result: { value: string }) => void) | null
}

