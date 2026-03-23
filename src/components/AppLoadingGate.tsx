import { AnimatePresence } from "framer-motion"
import { LoadingOverlay } from "./ui"

type AppLoadingGateProps = {
  isLoading: boolean
  message: string
  progress: number
}

export const AppLoadingGate = ({ isLoading, message, progress }: AppLoadingGateProps) => {
  return (
    <AnimatePresence>
      {isLoading && <LoadingOverlay message={message} progress={progress} />}
    </AnimatePresence>
  )
}
