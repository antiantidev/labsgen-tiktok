import { Sidebar, Titlebar, PageContainer } from "./layout"
import { AppRouteContent } from "./AppRouteContent"
import type { SidebarViewProps, AppRouteContentProps } from "../app/types"

type AppShellProps = {
  sidebarProps: SidebarViewProps
  routeContentProps: AppRouteContentProps
}

export const AppShell = ({ sidebarProps, routeContentProps }: AppShellProps) => {
  return (
    <>
      <Sidebar {...sidebarProps} />
      <main className="flex-1 flex flex-col min-w-0 relative bg-background">
        <Titlebar />
        <PageContainer>
          <AppRouteContent {...routeContentProps} />
        </PageContainer>
      </main>
    </>
  )
}
