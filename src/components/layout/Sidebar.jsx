import React from 'react'
import { LayoutDashboard, Terminal, Settings, Database, Key, Activity, ShieldCheck, ShieldAlert } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '../ui'

const NavItem = ({ id, icon: Icon, label, active, onClick, disabled }) => (
  <button
    onClick={() => !disabled && onClick(id)}
    disabled={disabled}
    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all relative group ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
  >
    {active && (
      <motion.div 
        layoutId="activeNav"
        className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-2xl"
        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
      />
    )}
    <Icon size={20} className={`relative z-10 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
    <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.2em]">{label}</span>
  </button>
)

export const Sidebar = ({ currentPage, setCurrentPage, username, canGoLive, version, isLoading }) => {
  const { t } = useTranslation()

  const menuItems = [
    { id: 'home', icon: LayoutDashboard, label: t('sidebar.dashboard') },
    { id: 'console', icon: Terminal, label: t('sidebar.console') },
    { id: 'setup', icon: Activity, label: t('sidebar.setup') },
    { id: 'tokens', icon: Key, label: t('sidebar.tokens') },
    { id: 'status', icon: Database, label: t('sidebar.status') },
    { id: 'settings', icon: Settings, label: t('sidebar.settings') },
  ]

  return (
    <aside className="w-72 h-screen flex flex-col border-r border-border bg-secondary/10 light:bg-secondary/30 relative z-50">
      <div className="p-8">
        <div className="flex items-center gap-4 px-2 mb-12">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <div className="w-5 h-5 border-4 border-primary-foreground rounded-full" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-sm tracking-tighter leading-none text-foreground uppercase">LABGEN</span>
            <span className="font-bold text-[10px] text-muted-foreground tracking-[0.3em]">TIKTOK</span>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <NavItem 
              key={item.id} 
              {...item} 
              active={currentPage === item.id} 
              onClick={setCurrentPage}
              disabled={isLoading}
            />
          ))}
        </nav>
      </div>

      <div className="mt-auto p-8 space-y-6">
        <div className="p-6 rounded-2xl bg-secondary border border-border relative overflow-hidden group shadow-sm">
          <div className="flex items-center gap-4 relative z-10">
            <div className={`p-2.5 rounded-xl ${canGoLive ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
              {canGoLive ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('tokens.username')}</span>
              {isLoading ? (
                <Skeleton className="h-4 w-20 mt-1" />
              ) : (
                <span className="text-xs font-bold truncate">{username}</span>
              )}
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
            {canGoLive ? <ShieldCheck size={80} /> : <ShieldAlert size={80} />}
          </div>
        </div>

        <div className="flex items-center justify-between px-4">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">{t('dashboard.version')}</span>
            <span className="text-[10px] font-bold opacity-40 italic">v{version}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
