import type { StreamDataState } from "../../../shared/domain/app"

export type ConsoleRouteProps = {
  streamData: StreamDataState
  startStream: () => Promise<void>
  endStream: () => Promise<void>
  canGoLive: boolean
  streamTitle: string
  gameCategory: string
  pushToast: (message: string, type?: string, duration?: number) => void
}

