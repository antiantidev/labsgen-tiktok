import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Terminal, Clock, Trash2, Search, Download, Filter, Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { Card, Button, Input } from '../components/ui'
import { useTranslation } from 'react-i18next'

const pageVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } }
}

const LogIcon = ({ level }) => {
  switch (level) {
    case 'success': return <CheckCircle2 size={12} className="text-primary" />
    case 'warn': return <AlertTriangle size={12} className="text-amber-500" />
    case 'error': return <XCircle size={12} className="text-rose-500" />
    default: return <Info size={12} className="text-blue-400" />
  }
}

const Pulse = ({ statusLog, setStatusLog }) => {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  const filteredLogs = useMemo(() => {
    return statusLog.filter(log => {
      const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = activeFilter === 'all' || log.level === activeFilter
      return matchesSearch && matchesFilter
    })
  }, [statusLog, searchQuery, activeFilter])

  const handleExport = () => {
    const content = statusLog.map(log => `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`).join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `labs-gen-tik-logs-${new Date().getTime()}.log`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const filters = [
    { id: 'all', label: t('pulse.all'), icon: Activity },
    { id: 'info', label: t('pulse.info'), icon: Info },
    { id: 'success', label: t('pulse.success'), icon: CheckCircle2 },
    { id: 'warn', label: t('pulse.warn'), icon: AlertTriangle },
    { id: 'error', label: t('pulse.error'), icon: XCircle }
  ]

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">{t('sidebar.system_pulse')}</h1>
          <p className="text-muted-foreground font-medium">{t('pulse.desc')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleExport} icon={Download} className="text-[10px]">{t('pulse.export')}</Button>
          <Button variant="ghost" onClick={() => setStatusLog([])} icon={Trash2} className="text-[10px] hover:text-rose-500">{t('pulse.clear_logs')}</Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
            <Search size={16} />
          </div>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('pulse.search_placeholder')}
            className="w-full bg-secondary/50 border border-border rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 ring-primary/20 outline-none transition-all"
          />
        </div>
        <div className="flex p-1 bg-secondary border border-border rounded-2xl overflow-x-auto custom-scrollbar no-scrollbar">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeFilter === f.id ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <f.icon size={12} />
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <Card className="flex-1 flex flex-col p-0 overflow-hidden bg-black/40 border-border relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-50" />
        <div className="bg-secondary/30 border-b border-border px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Kernel Activity Stream</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[9px] font-bold text-primary uppercase tracking-tighter italic">Live Monitor</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 font-mono text-[11px] space-y-2.5 custom-scrollbar">
          <AnimatePresence initial={false}>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <motion.div 
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-4 group hover:bg-white/[0.02] -mx-2 px-2 py-1 rounded transition-colors"
                >
                  <span className="text-zinc-600 shrink-0 select-none font-bold tabular-nums">
                    [{log.time}]
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <LogIcon level={log.level} />
                    <span className={`uppercase font-black text-[9px] tracking-tighter min-w-[50px] ${
                      log.level === 'success' ? 'text-primary' : 
                      log.level === 'warn' ? 'text-amber-500' : 
                      log.level === 'error' ? 'text-rose-500' : 'text-blue-400'
                    }`}>
                      {log.level}
                    </span>
                  </div>
                  <span className="text-zinc-300 group-hover:text-foreground transition-colors leading-relaxed break-all">
                    {log.message}
                  </span>
                </motion.div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground/20 space-y-4 italic">
                <Terminal size={48} />
                <p className="text-sm font-black uppercase tracking-[0.2em]">{t('pulse.listening')}</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  )
}

export default Pulse