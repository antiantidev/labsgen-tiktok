import React from "react"
import { AppGlobalModal } from "./components/AppGlobalModal"
import { AppToasts } from "./components/AppToasts"
import { AppLoadingGate } from "./components/AppLoadingGate"
import { AppShell } from "./components/AppShell"
import { useAppOrchestrator } from "./hooks"

const App = () => {
  const {
    isLoading,
    loadingMessage,
    loadProgress,
    toasts,
    dismissToast,
    sidebarProps,
    routeContentProps,
    modal,
    theme,
    closeModal
  } = useAppOrchestrator()

  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden font-['Plus_Jakarta_Sans']">
      <AppLoadingGate isLoading={isLoading} message={loadingMessage} progress={loadProgress} />
      <AppToasts toasts={toasts} dismissToast={dismissToast} />
      <AppShell sidebarProps={sidebarProps} routeContentProps={routeContentProps} />
      <AppGlobalModal modal={modal} theme={theme} closeModal={closeModal} />
    </div>
  )
}

export default App
