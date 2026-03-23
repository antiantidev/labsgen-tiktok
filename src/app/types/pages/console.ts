import type { StreamDataState } from "../../../shared/domain/app"

export type ConsolePageProps = {
  streamData: StreamDataState
  startStream: () => void | Promise<void>
  endStream: () => void | Promise<void>
  canGoLive: boolean
  streamTitle: string
  gameCategory: string
  pushToast?: (message: string, type?: string) => void
}

