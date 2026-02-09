import React from 'react'
import { LayoutDashboard, Radio, Settings, FileText, Users, Sliders, ShieldCheck, ShieldAlert } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '../ui'

const logoUrl = new URL('../../../resources/logo.svg', import.meta.url).href

const NavItem = ({ id, icon: Icon, label, active, onClick, disabled }) => (
  <button
    onClick={() => !disabled && onClick(id)}
    disabled={disabled}
    className={`w-full flex items-center gap-5 px-8 py-5 transition-colors relative group ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
  >
    <AnimatePresence>
      {active && (
        <motion.div 
          layoutId="activeSidebarHighlight"
          className="absolute inset-0 bg-primary/[0.08] z-0"
          initial={false}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
    </AnimatePresence>

    {active && (
      <motion.div 
        layoutId="activeSidebarIndicator"
        className="absolute right-0 top-3 bottom-3 w-1 rounded-full bg-primary z-10 shadow-[0_0_12px_hsl(var(--glow))]"
        initial={false}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      />
    )}

    <Icon size={22} className={`relative z-10 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
    <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.22em]">{label}</span>
  </button>
)

const Sidebar = ({ currentPage, setCurrentPage, username, canGoLive, version, isLoading }) => {
  const { t } = useTranslation()

  const menuItems = [
    { id: 'home', icon: LayoutDashboard, label: t('sidebar.dashboard') },
    { id: 'console', icon: Radio, label: t('sidebar.console') },
    { id: 'setup', icon: Sliders, label: t('sidebar.setup') },
    { id: 'tokens', icon: Users, label: t('sidebar.tokens') },
    { id: 'status', icon: FileText, label: t('sidebar.status') },
    { id: 'settings', icon: Settings, label: t('sidebar.settings') },
  ]

  return (
    <aside className="sidebar-shell w-72 h-screen flex flex-col border-r border-border/60 relative z-50 shadow-[0_18px_40px_rgba(0,0,0,0.35)] light:shadow-[0_14px_30px_rgba(0,0,0,0.10)]">
      <div className="py-12 flex flex-col items-center justify-center shrink-0">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shadow-[0_12px_30px_rgba(34,197,94,0.35)] group-hover:rotate-6 transition-transform duration-500 ring-1 ring-primary/20">
            <img src={logoUrl} alt="LABGEN TIKTOK" className="w-12 h-12 rounded-xl" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-[18px] tracking-tighter leading-none text-foreground uppercase">LABGEN</span>
            <span className="font-bold text-[11px] text-muted-foreground tracking-[0.4em]">TIKTOK</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 flex flex-col justify-center py-8 relative">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <NavItem 
              key={item.id} 
              {...item} 
              active={currentPage === item.id} 
              onClick={setCurrentPage}
              disabled={isLoading}
            />
          ))}
        </div>
      </nav>

      <div className="mt-auto shrink-0 border-t border-border/50 bg-secondary/10">
        <div className="p-6 space-y-6">
          <div className="p-5 rounded-2xl bg-secondary/60 border border-white/10 light:border-black/10 relative overflow-hidden group shadow-[0_12px_30px_rgba(0,0,0,0.35)] light:shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
            <div className="flex items-center gap-4 relative z-10">
              <div className={`p-2.5 rounded-lg shadow-inner ${canGoLive ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                {canGoLive ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{t('tokens.username')}</span>
                {isLoading ? (
                  <Skeleton className="h-4 w-24 mt-1" />
                ) : (
                  <span className="text-[13px] font-black truncate text-foreground">{username}</span>
                )}
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-500 pointer-events-none">
              {canGoLive ? <ShieldCheck size={90} /> : <ShieldAlert size={90} />}
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">{t('dashboard.version')}</span>
              <span className="text-[11px] font-black opacity-30 italic font-mono">v{version}</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_hsl(var(--primary))]" />
          </div>
        </div>
      </div>
    </aside>
  )
}

export { Sidebar }
