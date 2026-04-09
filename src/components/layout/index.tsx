import type { ReactNode } from "react"
import { useApiBridge } from "../../hooks"

export const Titlebar = () => {
  const api = useApiBridge()

  return (
    <header className="h-12 border-b border-border flex items-center justify-end px-3 gap-1 drag z-[100] shrink-0 bg-background">
      <button
        onClick={() => api.windowMinimize()}
        className="no-drag w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      >
        <div className="w-3 h-px bg-current" />
      </button>
      <button
        onClick={() => api.windowMaximize()}
        className="no-drag w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      >
        <div className="w-2.5 h-2.5 border border-current rounded-sm" />
      </button>
      <button
        onClick={() => api.windowClose()}
        className="no-drag w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
      >
        <div className="relative w-3 h-3">
          <span className="absolute left-1/2 top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 rotate-45 bg-current" />
          <span className="absolute left-1/2 top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-current" />
        </div>
      </button>
    </header>
  )
}

export const PageContainer = ({ children }: { children?: ReactNode }) => (
  <div className="flex-1 overflow-y-auto relative z-0">
    <div className="max-w-5xl mx-auto px-8 py-6">{children}</div>
  </div>
)

export { Sidebar } from "./Sidebar"
