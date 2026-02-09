import React, { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Home, 
  Terminal, 
  Activity, 
  Settings, 
  Info, 
  Heart, 
  Monitor, 
  LogOut, 
  Copy, 
  RefreshCw, 
  Play, 
  Square, 
  Eye, 
  EyeOff,
  User,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react'

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
      active 
        ? 'bg-primary/10 text-primary shadow-[0_0_20px_rgba(49,251,154,0.1)]' 
        : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
    }`}
  >
    <Icon size={20} className={active ? 'text-primary' : 'group-hover:scale-110 transition-transform'} />
    <span className="text-sm font-medium">{label}</span>
    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_#31fb9a]" />}
  </button>
)

const Card = ({ children, title, className = "" }) => (
  <div className={`glass border rounded-2xl p-5 hover:border-white/10 transition-colors ${className}`}>
    {title && <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">{title}</h3>}
    {children}
  </div>
)

const StatCard = ({ label, value, icon: Icon, colorClass = "text-primary" }) => (
  <div className="glass border rounded-2xl p-4 flex items-center gap-4">
    <div className={`p-3 rounded-xl bg-white/5 ${colorClass}`}>
      <Icon size={20} />
    </div>
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  </div>
)

// --- Main App ---

const App = () => {
  const [currentPage, setCurrentPage] = useState('home')
  const [token, setToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [streamTitle, setStreamTitle] = useState('')
  const [gameCategory, setGameCategory] = useState('')
  const [gameMaskId, setGameMaskId] = useState('')
  const [mature, setMature] = useState(false)
  const [isWebLoading, setIsWebLoading] = useState(false)
  const [status, setStatus] = useState({
    username: 'Guest',
    appStatus: 'Offline',
    canGoLive: false,
    badge: 'Disconnected'
  })
  const [streamData, setStreamData] = useState({
    url: '',
    key: '',
    id: null,
    isLive: false
  })
  const [statusLog, setStatusLog] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [modal, setModal] = useState({ show: false, title: '', body: '', buttons: [], resolve: null })

  // --- Logic (Gữ nguyên logic từ phiên bản trước nhưng tối ưu hóa) ---
  
  const pushStatus = useCallback((message) => {
    const entry = { message, time: new Date().toLocaleTimeString(), id: Date.now() }
    setStatusLog(prev => [entry, ...prev].slice(0, 50))
  }, [])

  const showModal = useCallback((title, body, buttons = [{ label: 'OK', value: true }]) => {
    return new Promise((resolve) => {
      setModal({ show: true, title, body, buttons, resolve })
    })
  }, [])

  const closeModal = (value) => {
    if (modal.resolve) modal.resolve({ value })
    setModal(prev => ({ ...prev, show: false, resolve: null }))
  }

  const refreshAccountInfo = useCallback(async (manualToken) => {
    const targetToken = manualToken || token
    if (!targetToken) return
    
    pushStatus('Refreshing account data...')
    await window.api.setToken(targetToken)
    const res = await window.api.refreshAccount()
    
    if (res.ok) {
      const { user, application_status, can_be_live } = res.info || {}
      setStatus({
        username: user?.username || 'Unknown',
        appStatus: application_status?.status || 'Unknown',
        canGoLive: !!can_be_live,
        badge: can_be_live ? 'Ready' : 'Check'
      })
      pushStatus(`Logged in as ${user?.username}`)
    } else {
      pushStatus(`Error: ${res.error}`)
    }
  }, [token, pushStatus])

  useEffect(() => {
    const init = async () => {
      const data = await window.api.loadConfig()
      if (data.token) {
        setToken(data.token)
        refreshAccountInfo(data.token)
      }
      setStreamTitle(data.title || '')
      setGameCategory(data.game || '')
      setMature(data.audience_type === '1')
      window.api.rendererReady()
    }
    init()
  }, [])

  // --- Pages ---

  const renderHome = () => (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, <span className="text-primary">{status.username}</span></h1>
        <p className="text-muted-foreground">Manage your TikTok stream credentials with ease.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Account Status" value={status.badge} icon={ShieldCheck} colorClass={status.canGoLive ? "text-primary" : "text-amber-500"} />
        <StatCard label="Stream State" value={streamData.isLive ? "LIVE" : "Idle"} icon={Activity} colorClass={streamData.isLive ? "text-rose-500" : "text-muted-foreground"} />
        <StatCard label="App Version" value="v0.1.0" icon={Info} colorClass="text-blue-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Quick Actions">
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setCurrentPage('console')}
              className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20 group"
            >
              <Terminal size={32} className="group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold">Open Console</span>
            </button>
            <button 
              onClick={() => window.api.openExternal("https://livecenter.tiktok.com/live_monitor")}
              className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-blue-500/10 hover:text-blue-400 transition-all border border-transparent hover:border-blue-500/20 group"
            >
              <Monitor size={32} className="group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold">Live Monitor</span>
            </button>
          </div>
        </Card>

        <Card title="Account Summary">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-xs text-muted-foreground">Username</span>
              <span className="font-semibold">{status.username}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-xs text-muted-foreground">Permissions</span>
              <span className={`text-xs px-2 py-1 rounded-md font-bold ${status.canGoLive ? 'bg-primary/20 text-primary' : 'bg-amber-500/20 text-amber-500'}`}>
                {status.canGoLive ? 'FULL ACCESS' : 'RESTRICTED'}
              </span>
            </div>
            <button 
              onClick={() => window.api.openExternal("https://buymeacoffee.com/loukious")}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity"
            >
              <Heart size={16} fill="currentColor" />
              Support Creator
            </button>
          </div>
        </Card>
      </div>
    </div>
  )

  const renderConsole = () => (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Broadcast Console</h1>
          <p className="text-sm text-muted-foreground">Configure and start your broadcast session.</p>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${streamData.isLive ? 'bg-rose-500/20 text-rose-500 animate-pulse' : 'bg-white/5 text-muted-foreground'}`}>
          <div className={`w-2 h-2 rounded-full ${streamData.isLive ? 'bg-rose-500' : 'bg-muted-foreground'}`} />
          {streamData.isLive ? 'Live Session Active' : 'System Ready'}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card title="Stream Configuration">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1 mb-1.5 block">Stream Title</label>
                <input 
                  className="w-full bg-white/5 border rounded-xl px-4 py-3 focus:ring-2 ring-primary/20 outline-none transition-all"
                  placeholder="Enter a catchy title..."
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1 mb-1.5 block">Game Category</label>
                <div className="relative">
                  <input 
                    className="w-full bg-white/5 border rounded-xl px-4 py-3 focus:ring-2 ring-primary/20 outline-none transition-all"
                    placeholder="Search game categories..."
                    value={gameCategory}
                    onChange={(e) => setGameCategory(e.target.value)}
                  />
                  <Terminal size={18} className="absolute right-4 top-3.5 text-muted-foreground" />
                </div>
              </div>
              <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                <input type="checkbox" checked={mature} onChange={(e) => setMature(e.target.checked)} className="accent-primary w-4 h-4" />
                <span className="text-sm font-medium">Mark as Mature Content</span>
              </label>
            </div>
          </Card>

          <Card title="Stream Output">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
                <div className="bg-black/40 border rounded-xl px-4 py-3 text-xs font-mono text-muted-foreground overflow-hidden whitespace-nowrap overflow-ellipsis">
                  {streamData.url || 'RTMP URL will appear here...'}
                </div>
                <button onClick={() => streamData.url && navigator.clipboard.writeText(streamData.url)} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <Copy size={18} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
                <div className="bg-black/40 border rounded-xl px-4 py-3 text-xs font-mono text-muted-foreground overflow-hidden whitespace-nowrap overflow-ellipsis">
                  {streamData.key ? '••••••••••••••••' : 'Stream Key will appear here...'}
                </div>
                <button onClick={() => streamData.key && navigator.clipboard.writeText(streamData.key)} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <Copy size={18} />
                </button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Session Control">
            <div className="space-y-3">
              <button 
                disabled={!status.canGoLive || streamData.isLive}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-primary text-primary-foreground font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:hover:scale-100 shadow-lg shadow-primary/20"
              >
                <Play size={20} fill="currentColor" />
                Go Live Now
              </button>
              <button 
                disabled={!streamData.isLive}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold hover:bg-rose-500 hover:text-white transition-all disabled:opacity-30 shadow-lg shadow-rose-500/5"
              >
                <Square size={20} fill="currentColor" />
                End Stream
              </button>
            </div>
            <div className="mt-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex gap-3">
              <AlertCircle className="text-amber-500 shrink-0" size={18} />
              <p className="text-[10px] text-amber-200/60 leading-relaxed">
                Ensure you have set up your scenes in OBS or Streamlabs Desktop before going live.
              </p>
            </div>
          </Card>

          <Card title="Active Token">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-black/40 border rounded-xl px-3 py-2 text-[10px] font-mono text-muted-foreground">
                {token ? (showToken ? token : '••••••••' + token.slice(-8)) : 'No token loaded'}
              </div>
              <button onClick={() => setShowToken(!showToken)} className="p-2 rounded-lg bg-white/5">
                {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button onClick={() => refreshAccountInfo()} className="flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 text-[10px] font-bold hover:bg-white/10 transition-all">
                <RefreshCw size={12} /> Sync
              </button>
              <button className="flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 text-[10px] font-bold hover:bg-white/10 transition-all text-rose-400">
                <LogOut size={12} /> Eject
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )

  const renderStatus = () => (
    <div className="space-y-6 animate-in flex flex-col h-full">
      <div>
        <h1 className="text-2xl font-bold">System Pulse</h1>
        <p className="text-sm text-muted-foreground">Real-time activity logs and system health monitor.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass border p-4 rounded-2xl">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">API Status</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-sm font-semibold">Operational</span>
          </div>
        </div>
        <div className="glass border p-4 rounded-2xl">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">RTMP Server</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-sm font-semibold">Healthy</span>
          </div>
        </div>
        <div className="glass border p-4 rounded-2xl md:col-span-2">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Active Session ID</div>
          <div className="text-sm font-mono truncate">{streamData.id || 'N/A'}</div>
        </div>
      </div>

      <div className="flex-1 glass border rounded-2xl flex flex-col min-h-0">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest">Activity Log</span>
          </div>
          <button onClick={() => setStatusLog([])} className="text-[10px] font-bold text-muted-foreground hover:text-foreground">CLEAR LOGS</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-2">
          {statusLog.map(log => (
            <div key={log.id} className="flex gap-4 group">
              <span className="text-muted-foreground shrink-0">{log.time}</span>
              <span className="text-zinc-300 group-hover:text-white transition-colors">{log.message}</span>
            </div>
          ))}
          {statusLog.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-2">
              <Terminal size={32} />
              <p>No system activity recorded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen w-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r flex flex-col glass z-20">
        <div className="h-16 flex items-center gap-3 px-6 drag">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(49,251,154,0.3)]">
            <Terminal size={18} className="text-primary-foreground" />
          </div>
          <span className="font-black tracking-tighter text-xl">LABGEN<span className="text-primary">TIK</span></span>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-2">
          <SidebarItem icon={Home} label="Dashboard" active={currentPage === 'home'} onClick={() => setCurrentPage('home')} />
          <SidebarItem icon={Terminal} label="Console" active={currentPage === 'console'} onClick={() => setCurrentPage('console')} />
          <SidebarItem icon={Activity} label="Status" active={currentPage === 'status'} onClick={() => setCurrentPage('status')} />
          
          <div className="pt-6 pb-2 px-4">
            <div className="text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase">External</div>
          </div>
          <SidebarItem icon={Monitor} label="Live Monitor" onClick={() => window.api.openExternal("https://livecenter.tiktok.com/live_monitor")} />
          <SidebarItem icon={Heart} label="Donate" onClick={() => window.api.openExternal("https://buymeacoffee.com/loukious")} />
        </nav>

        <div className="p-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center font-bold text-primary-foreground">
                {status.username[0].toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold truncate">{status.username}</span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${status.canGoLive ? 'bg-primary' : 'bg-rose-500'}`} />
                  {status.canGoLive ? 'Premium Access' : 'Limited Access'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Titlebar */}
        <header className="h-16 flex items-center justify-end px-4 gap-2 drag z-10">
          <button onClick={() => window.api.windowMinimize()} className="nodrag w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground">
            <span className="text-xl leading-none mt-[-8px]">_</span>
          </button>
          <button onClick={() => window.api.windowMaximize()} className="nodrag w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground">
            <div className="w-3 h-3 border-2 border-current rounded-sm" />
          </button>
          <button onClick={() => window.api.windowClose()} className="nodrag w-10 h-10 flex items-center justify-center rounded-xl hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all">
            <span className="text-xl leading-none">×</span>
          </button>
        </header>

        {/* Page Container */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
          <div className="max-w-5xl mx-auto h-full">
            {currentPage === 'home' && renderHome()}
            {currentPage === 'console' && renderConsole()}
            {currentPage === 'status' && renderStatus()}
          </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none" />
      </main>

      {/* Modal Overlay */}
      {modal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => closeModal(false)} />
          <div className="relative glass border w-full max-w-md rounded-3xl p-8 space-y-6 shadow-2xl">
            <div className="space-y-2">
              <h2 className="text-xl font-bold">{modal.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{modal.body}</p>
            </div>
            <div className="flex justify-end gap-3">
              {modal.buttons.map((btn, i) => (
                <button
                  key={i}
                  onClick={() => closeModal(btn.value)}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    btn.primary !== false 
                      ? 'bg-primary text-primary-foreground hover:scale-105' 
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App