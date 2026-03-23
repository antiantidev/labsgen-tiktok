import Dashboard from "../pages/Dashboard"
import Console from "../pages/Console"
import LiveSetup from "../pages/LiveSetup"
import Pulse from "../pages/Pulse"
import Settings from "../pages/Settings"
import TokenVault from "../pages/TokenVault"
import type { AppRouteContentProps } from "../app/types"

export const resolveAppRouteContent = ({
  common,
  dashboard,
  consolePage,
  setupPage,
  tokensPage,
  pulsePage,
  settingsPage
}: AppRouteContentProps) => {
  const { currentPage, setCurrentPage, isLoading } = common

  switch (currentPage) {
    case "home":
      return (
        <Dashboard
          status={dashboard.status}
          streamData={dashboard.streamData}
          onNavigate={setCurrentPage}
          isLoading={isLoading}
        />
      )
    case "console":
      return (
        <Console
          streamData={consolePage.streamData}
          startStream={consolePage.startStream}
          endStream={consolePage.endStream}
          canGoLive={consolePage.canGoLive}
          streamTitle={consolePage.streamTitle}
          gameCategory={consolePage.gameCategory}
          pushToast={consolePage.pushToast}
        />
      )
    case "setup":
      return (
        <LiveSetup
          streamTitle={setupPage.streamTitle}
          setStreamTitle={setupPage.setStreamTitle}
          gameCategory={setupPage.gameCategory}
          handleSearch={setupPage.handleSearch}
          suggestions={setupPage.suggestions}
          showSuggestions={setupPage.showSuggestions}
          setShowSuggestions={setupPage.setShowSuggestions}
          setGameCategory={setupPage.setGameCategory}
          setGameMaskId={setupPage.setGameMaskId}
          mature={setupPage.mature}
          setMature={setupPage.setMature}
          saveConfig={setupPage.saveConfig}
          gameMaskId={setupPage.gameMaskId}
          pushToast={setupPage.pushToast}
        />
      )
    case "tokens":
      return (
        <TokenVault
          isDriverMissing={tokensPage.isDriverMissing}
          loadLocalToken={tokensPage.loadLocalToken}
          loadWebToken={tokensPage.loadWebToken}
          isWebLoading={tokensPage.isWebLoading}
          refreshAccountInfo={async () => {
            await tokensPage.refreshAccountInfo(undefined, tokensPage.activeAccountId)
          }}
          canGoLive={tokensPage.status.canGoLive}
          status={tokensPage.status}
          accounts={tokensPage.accounts}
          selectAccount={tokensPage.selectAccount}
          deleteAccount={tokensPage.deleteAccount}
          activeAccountId={tokensPage.activeAccountId}
          isLoading={isLoading}
          setCurrentPage={setCurrentPage}
        />
      )
    case "status":
      return (
        <Pulse
          statusLog={pulsePage.statusLog}
          setStatusLog={pulsePage.setStatusLog}
          logPage={pulsePage.logPage}
          logPageSize={pulsePage.logPageSize}
          logTotal={pulsePage.logTotal}
          loadLogs={pulsePage.loadLogs}
          clearLogs={pulsePage.clearLogs}
        />
      )
    case "settings":
      return (
        <Settings
          isDriverMissing={settingsPage.isDriverMissing}
          setIsDriverMissing={settingsPage.setIsDriverMissing}
          settings={settingsPage.settings}
          setSettings={settingsPage.setSettings}
          saveConfig={settingsPage.saveConfig}
          defaultPath={settingsPage.defaultPath}
          systemPaths={settingsPage.systemPaths}
          version={settingsPage.version}
          showModal={settingsPage.showModal}
          theme={settingsPage.theme}
          toggleTheme={settingsPage.toggleTheme}
          pushToast={settingsPage.pushToast}
          updateProgress={settingsPage.updateProgress}
        />
      )
    default:
      return null
  }
}
