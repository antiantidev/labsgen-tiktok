import type { Dispatch, SetStateAction } from "react"
import type { PageId } from "../../../shared/domain/app"

export type SidebarViewProps = {
  currentPage: PageId
  setCurrentPage: Dispatch<SetStateAction<PageId>>
  username: string
  canGoLive: boolean
  version: string
  isLoading: boolean
}

