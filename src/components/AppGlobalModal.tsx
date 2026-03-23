import { AnimatePresence, motion } from "framer-motion"
import { Button } from "./ui"
import type { ModalViewState } from "../app/types"
import type { ThemeMode } from "../shared/domain/app"

type AppGlobalModalProps = {
  modal: Pick<ModalViewState, "show" | "title" | "body" | "buttons">
  theme: ThemeMode
  closeModal: (value: string) => void
}

export const AppGlobalModal = ({ modal, theme, closeModal }: AppGlobalModalProps) => {
  return (
    <AnimatePresence>
      {modal.show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-[300] flex items-center justify-center p-8 backdrop-blur-md ${
            theme === "light" ? "bg-white/40" : "bg-black/60"
          }`}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="glass border border-white/10 w-full max-w-lg rounded-xl p-12 space-y-8 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-black tracking-tight">{modal.title}</h2>
              <p className="text-muted-foreground text-[14px] font-medium leading-relaxed">{modal.body}</p>
            </div>
            <div className="flex justify-end gap-4">
              {modal.buttons.map((button, index) => (
                <Button
                  key={index}
                  variant={button.primary !== false ? "primary" : "secondary"}
                  onClick={() => closeModal(button.value)}
                  className="px-8 py-4"
                >
                  {button.label}
                </Button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
