import type { PageId, StatusState, StreamDataState } from "../../../shared/domain/app"

export type DashboardPageProps = {
  status: StatusState
  streamData: StreamDataState
  onNavigate: (page: PageId) => void
  isLoading: boolean
}

