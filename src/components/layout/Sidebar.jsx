import React from 'react'
import { motion } from 'framer-motion'
import { Terminal, Home, Activity, Monitor, Heart, Sliders, Key, Radio, Sun, Moon, Languages, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '../ui'

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <motion.button
    whileHover={{ x: 4 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${
      active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
    }`}
  >
    <Icon size={18} className={active ? 'text-primary' : 'group-hover:scale-110 transition-transform'} />
    <span className="text-[11px] font-black uppercase tracking-wider">{label}</span>
    {active && (
      <motion.div layoutId="activeSide" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_#31fb9a]" />
    )}
  </motion.button>
)

export const Sidebar = ({ currentPage, setCurrentPage, username, canGoLive, version, theme, toggleTheme, language, toggleLanguage, isLoading }) => {
  const { t } = useTranslation()

  return (
    <aside className="w-72 border-r border-border flex flex-col glass z-20 relative">
      <div className="h-20 flex items-center justify-between px-8 drag">
        <div className="flex items-center gap-4">
          <motion.div whileHover={{ rotate: 90 }} className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center shadow-2xl shadow-primary/40">
            <Terminal size={22} className="text-primary-foreground" />
          </motion.div>
          <div className="flex flex-col -space-y-1">
            <span className="font-black tracking-tighter text-2xl uppercase italic">LABGEN</span>
            <span className="text-primary font-black text-sm tracking-[0.3em] ml-1">TIKTOK</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleLanguage}
            className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-primary transition-colors nodrag flex items-center gap-1 min-w-[44px] justify-center"
          >
            <Languages size={18} />
            <span className="text-[10px] font-black uppercase">{language}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-primary transition-colors nodrag min-w-[40px] flex justify-center"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="px-5 mb-3 text-[9px] font-black text-muted-foreground tracking-[0.3em] uppercase opacity-40">{t('sidebar.dashboard')}</div>
        <SidebarItem icon={Home} label={t('sidebar.overview')} active={currentPage === 'home'} onClick={() => setCurrentPage('home')} />
        
        <div className="px-5 mt-6 mb-3 text-[9px] font-black text-muted-foreground tracking-[0.3em] uppercase opacity-40">{t('sidebar.streaming')}</div>
        <SidebarItem icon={Radio} label={t('sidebar.broadcast')} active={currentPage === 'console'} onClick={() => setCurrentPage('console')} />
        <SidebarItem icon={Sliders} label={t('sidebar.live_setup')} active={currentPage === 'setup'} onClick={() => setCurrentPage('setup')} />
        <SidebarItem icon={Key} label={t('sidebar.token_vault')} active={currentPage === 'tokens'} onClick={() => setCurrentPage('tokens')} />
        
        <div className="px-5 mt-6 mb-3 text-[9px] font-black text-muted-foreground tracking-[0.3em] uppercase opacity-40">{t('sidebar.system')}</div>
        <SidebarItem icon={Activity} label={t('sidebar.system_pulse')} active={currentPage === 'status'} onClick={() => setCurrentPage('status')} />
        <SidebarItem icon={Settings} label={t('sidebar.settings') || 'Settings'} active={currentPage === 'settings'} onClick={() => setCurrentPage('settings')} />
        
        <div className="pt-8 pb-4 px-5 text-[9px] font-black text-muted-foreground tracking-[0.3em] uppercase opacity-40">{t('sidebar.links')}</div>
        <SidebarItem icon={Monitor} label={t('sidebar.live_center')} onClick={() => window.api.openExternal("https://livecenter.tiktok.com/live_monitor")} />
        <SidebarItem icon={Heart} label={t('sidebar.support')} onClick={() => window.api.openExternal("https://buymeacoffee.com/loukious")} />
      </nav>

      <div className="p-6 space-y-4">
        <div className="p-5 rounded-3xl bg-secondary border border-border flex items-center gap-4 group">
          <div className="relative shrink-0">
            {isLoading ? (
              <Skeleton className="w-12 h-12 rounded-2xl" />
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center font-black text-foreground shadow-xl italic">
                  {username ? username[0].toUpperCase() : 'G'}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${canGoLive ? 'bg-primary' : 'bg-rose-500'}`} />
              </>
            )}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            ) : (
              <>
                <span className="text-sm font-black truncate">{username === 'Guest' ? t('tokens.guest') : username}</span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{canGoLive ? t('common.pro_streamer') : t('common.basic_user')}</span>
              </>
            )}
          </div>
        </div>
        <div className="text-center">
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-30 italic">{t('common.version')} {version}</span>
        </div>
      </div>
    </aside>
  )
}
