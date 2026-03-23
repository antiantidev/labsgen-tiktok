import { Sidebar, Titlebar, PageContainer } from "./layout"
import { AppRouteContent } from "./AppRouteContent"
import { AppBackgroundEffects } from "./AppBackgroundEffects"
import type { SidebarViewProps, AppRouteContentProps } from "../app/types"

type AppShellProps = {
  sidebarProps: SidebarViewProps
  routeContentProps: AppRouteContentProps
}

export const AppShell = ({ sidebarProps, routeContentProps }: AppShellProps) => {
  return (
    <>
      <Sidebar {...sidebarProps} />
      <main className="flex-1 flex flex-col min-w-0 relative bg-[radial-gradient(circle_at_top_right,rgba(49,251,154,0.03),transparent_40%)]">
        <Titlebar />
        <PageContainer>
          <AppRouteContent {...routeContentProps} />
        </PageContainer>
        <AppBackgroundEffects />
      </main>
    </>
  )
}
