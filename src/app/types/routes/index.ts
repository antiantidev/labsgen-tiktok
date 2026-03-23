import type { CommonRouteProps } from "./common"
import type { ConsoleRouteProps } from "./console"
import type { DashboardRouteProps } from "./dashboard"
import type { PulseRouteProps } from "./pulse"
import type { SettingsRouteProps } from "./settings"
import type { SetupRouteProps } from "./setup"
import type { TokensRouteProps } from "./tokens"

export type {
  CommonRouteProps,
  ConsoleRouteProps,
  DashboardRouteProps,
  PulseRouteProps,
  SettingsRouteProps,
  SetupRouteProps,
  TokensRouteProps
}

export type AppRouteContentProps = {
  common: CommonRouteProps
  dashboard: DashboardRouteProps
  consolePage: ConsoleRouteProps
  setupPage: SetupRouteProps
  tokensPage: TokensRouteProps
  pulsePage: PulseRouteProps
  settingsPage: SettingsRouteProps
}

