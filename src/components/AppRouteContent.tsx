import { AnimatePresence } from "framer-motion"
import type { AppRouteContentProps } from "../app/types"
import { resolveAppRouteContent } from "./appRouteContentResolver"

export const AppRouteContent = (props: AppRouteContentProps) => (
  <AnimatePresence mode="wait">{resolveAppRouteContent(props)}</AnimatePresence>
)
