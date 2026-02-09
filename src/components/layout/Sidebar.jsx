import React from 'react'
import { motion } from 'framer-motion'
import { Terminal, Home, Activity, Monitor, Heart, Sliders, Key, Radio } from 'lucide-react'

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <motion.button
    whileHover={{ x: 4 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${
      active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
    }`}
  >
    <Icon size={18} className={active ? 'text-primary' : 'group-hover:scale-110 transition-transform'} />
    <span className="text-[11px] font-black uppercase tracking-wider">{label}</span>
    {active && (
      <motion.div layoutId="activeSide" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_#31fb9a]" />
    )}
  </motion.button>
)

export const Sidebar = ({ currentPage, setCurrentPage, username, canGoLive }) => {
  return (
    <aside className="w-72 border-r border-white/5 flex flex-col glass z-20 relative">
      <div className="h-20 flex items-center gap-4 px-8 drag">
        <motion.div whileHover={{ rotate: 90 }} className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center shadow-2xl shadow-primary/40">
          <Terminal size={22} className="text-primary-foreground" />
        </motion.div>
        <div className="flex flex-col -space-y-1">
          <span className="font-black tracking-tighter text-2xl uppercase italic">LABGEN</span>
          <span className="text-primary font-black text-sm tracking-[0.3em] ml-1">TIKTOK</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="px-5 mb-3 text-[9px] font-black text-muted-foreground tracking-[0.3em] uppercase opacity-40">Dashboard</div>
        <SidebarItem icon={Home} label="Overview" active={currentPage === 'home'} onClick={() => setCurrentPage('home')} />
        
        <div className="px-5 mt-6 mb-3 text-[9px] font-black text-muted-foreground tracking-[0.3em] uppercase opacity-40">Streaming</div>
        <SidebarItem icon={Radio} label="Broadcast" active={currentPage === 'console'} onClick={() => setCurrentPage('console')} />
        <SidebarItem icon={Sliders} label="Live Setup" active={currentPage === 'setup'} onClick={() => setCurrentPage('setup')} />
        <SidebarItem icon={Key} label="Token Vault" active={currentPage === 'tokens'} onClick={() => setCurrentPage('tokens')} />
        
        <div className="px-5 mt-6 mb-3 text-[9px] font-black text-muted-foreground tracking-[0.3em] uppercase opacity-40">System</div>
        <SidebarItem icon={Activity} label="System Pulse" active={currentPage === 'status'} onClick={() => setCurrentPage('status')} />
        
        <div className="pt-8 pb-4 px-5 text-[9px] font-black text-muted-foreground tracking-[0.3em] uppercase opacity-40">Links</div>
        <SidebarItem icon={Monitor} label="Live Center" onClick={() => window.api.openExternal("https://livecenter.tiktok.com/live_monitor")} />
        <SidebarItem icon={Heart} label="Support" onClick={() => window.api.openExternal("https://buymeacoffee.com/loukious")} />
      </nav>

      <div className="p-6">
        <div className="p-5 rounded-3xl bg-white/5 border border-white/5 flex items-center gap-4 group">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center font-black text-white shadow-xl italic">
              {username ? username[0].toUpperCase() : 'G'}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-zinc-900 ${canGoLive ? 'bg-primary' : 'bg-rose-500'}`} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-black truncate">{username}</span>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{canGoLive ? 'Pro Streamer' : 'Basic User'}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}