import type { Dispatch, SetStateAction } from "react"
import { LayoutDashboard, Radio, Settings, FileText, Users, Sliders, ShieldCheck, ShieldAlert, Heart, type LucideIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Skeleton } from "../ui"
import type { PageId } from "../../shared/domain/app"
import { useApiBridge } from "../../hooks"

const logoUrl = new URL("../../../resources/logo.svg", import.meta.url).href

type NavItemProps = {
  id: PageId
  icon: LucideIcon
  label: string
  active: boolean
  onClick: Dispatch<SetStateAction<PageId>>
  disabled?: boolean
}

const NavItem = ({ id, icon: Icon, label, active, onClick, disabled }: NavItemProps) => (
  <button
    onClick={() => !disabled && onClick(id)}
    disabled={disabled}
    className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm transition-colors relative ${disabled ? "opacity-40 pointer-events-none" : ""} ${active ? "bg-secondary text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}
  >
    <Icon size={15} className="shrink-0" />
    <span>{label}</span>
  </button>
)

type SidebarProps = {
  currentPage: PageId
  setCurrentPage: Dispatch<SetStateAction<PageId>>
  username: string
  canGoLive: boolean
  version: string
  isLoading: boolean
}

const Sidebar = ({ currentPage, setCurrentPage, username, canGoLive, version, isLoading }: SidebarProps) => {
  const api = useApiBridge()
  const { t } = useTranslation()

  const menuItems: Array<{ id: PageId; icon: LucideIcon; label: string }> = [
    { id: "home", icon: LayoutDashboard, label: t("sidebar.dashboard") },
    { id: "console", icon: Radio, label: t("sidebar.console") },
    { id: "setup", icon: Sliders, label: t("sidebar.setup") },
    { id: "tokens", icon: Users, label: t("sidebar.tokens") },
    { id: "status", icon: FileText, label: t("sidebar.status") },
    { id: "settings", icon: Settings, label: t("sidebar.settings") }
  ]

  return (
    <aside className="w-56 h-screen flex flex-col border-r border-border bg-background relative z-50">
      <div className="px-4 h-12 flex items-center gap-2.5 border-b border-border shrink-0 drag">
        <img src={logoUrl} alt="Labsgen Tiktok" className="w-5 h-5 rounded no-drag" />
        <div className="flex flex-col no-drag">
          <span className="font-semibold text-sm leading-none text-foreground">Labsgen</span>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3">
        <div className="space-y-0.5">
          {menuItems.map((item) => (
            <NavItem key={item.id} {...item} active={currentPage === item.id} onClick={setCurrentPage} disabled={isLoading} />
          ))}
        </div>
      </nav>

      <div className="px-3 py-3 border-t border-border space-y-2">
        <div className="flex items-center gap-2.5 px-1">
          <div className={`w-2 h-2 rounded-full shrink-0 ${canGoLive ? "bg-success" : "bg-destructive"}`} />
          <div className="flex flex-col min-w-0 flex-1">
            {isLoading ? (
              <Skeleton className="h-3 w-16" />
            ) : (
              <span className="text-xs font-medium text-foreground truncate">{username}</span>
            )}
          </div>
          {canGoLive ? <ShieldCheck size={13} className="text-success shrink-0" /> : <ShieldAlert size={13} className="text-destructive shrink-0" />}
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-2xs text-muted-foreground font-mono">v{version}</span>
          <button
            onClick={() => api.openExternal("https://ko-fi.com/chokernguyen")}
            className="inline-flex items-center gap-1 text-2xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Heart size={10} />
            <span>{t("dashboard.support_project")}</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

export { Sidebar }
