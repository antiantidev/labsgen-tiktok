import type { Dispatch, SetStateAction } from "react"
import type { PageId } from "../../../shared/domain/app"

export type CommonRouteProps = {
  currentPage: PageId
  setCurrentPage: Dispatch<SetStateAction<PageId>>
  isLoading: boolean
}

