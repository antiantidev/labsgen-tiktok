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
    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-all duration-200 select-none ${disabled ? "opacity-30 pointer-events-none" : ""} ${active ? "bg-foreground/5 text-foreground font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"}`}
  >
    <Icon size={16} className={`shrink-0 transition-colors ${active ? "text-foreground" : "text-muted-foreground/60"}`} />
    <span className="truncate">{label}</span>
    {active && (
      <div className="absolute left-0 w-0.5 h-3.5 bg-foreground rounded-full" />
    )}
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
    <aside className="w-56 h-screen flex flex-col border-r border-border bg-secondary/30 shrink-0 relative z-50">
      <div className="px-5 h-10 flex items-center gap-2.5 border-b border-border/50 shrink-0 drag">
        <img src={logoUrl} alt="Labsgen Tiktok" className="w-5 h-5 rounded-sm p-0.5 bg-foreground/5 no-drag" />
        <span className="font-bold text-xs tracking-tight text-foreground/80 no-drag select-none uppercase">Labsgen</span>
      </div>

      <nav className="flex-1 px-3 py-6 overflow-y-auto space-y-1">
        {menuItems.map((item) => (
          <NavItem key={item.id} {...item} active={currentPage === item.id} onClick={setCurrentPage} disabled={isLoading} />
        ))}
      </nav>

      <div className="p-4 border-t border-border/50 space-y-4">
        <div className="flex items-center gap-3 px-1">
          <div className="relative shrink-0">
            <div className={`w-2 h-2 rounded-full ${canGoLive ? "bg-success" : "bg-destructive"}`} />
            {canGoLive && <div className="absolute inset-0 bg-success rounded-full animate-ping opacity-20" />}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            {isLoading ? (
              <Skeleton className="h-3 w-16" />
            ) : (
              <span className="text-[11px] font-bold text-foreground truncate tracking-wide">{username}</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] text-muted-foreground/40 font-mono font-medium tabular-nums select-none">v{version}</span>
          <button
            onClick={() => api.openExternal("https://ko-fi.com/chokernguyen")}
            className="inline-flex items-center gap-1 text-[9px] font-bold text-muted-foreground/40 hover:text-foreground transition-all duration-200 uppercase tracking-widest"
          >
            <Heart size={10} className="text-destructive/40" />
            <span>Support</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

export { Sidebar }
