import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Terminal, Search, Trash2, Download, Filter, 
  Info, AlertTriangle, XCircle, CheckCircle2,
  BarChart3, Clock, ChevronRight
} from 'lucide-react'
import { Card, Button, Input } from '../components/ui'
import { useTranslation } from 'react-i18next'

const pageVariants = {
  initial: { opacity: 0, y: 10, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -10, filter: 'blur(10px)', transition: { duration: 0.2 } }
}

const LogBadge = ({ level }) => {
  const { t } = useTranslation()
  const configs = {
    info: { icon: Info, color: 'text-info bg-info/10 border-info/20' },
    success: { icon: CheckCircle2, color: 'text-primary bg-primary/10 border-primary/20' },
    warn: { icon: AlertTriangle, color: 'text-warning bg-warning/10 border-warning/20' },
    error: { icon: XCircle, color: 'text-destructive bg-destructive/10 border-destructive/20' }
  }
  const config = configs[level] || configs.info
  const Icon = config.icon

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-tighter ${config.color}`}>
      <Icon size={10} />
      {t(`pulse.filter_${level}`)}
    </div>
  )
}

const Pulse = ({ statusLog = [], setStatusLog }) => {
  const { t } = useTranslation()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const stats = useMemo(() => ({
    total: statusLog.length,
    error: statusLog.filter(l => l.level === 'error').length,
    warn: statusLog.filter(l => l.level === 'warn').length,
    success: statusLog.filter(l => l.level === 'success').length
  }), [statusLog])

  const filteredLogs = useMemo(() => {
    return statusLog.filter(log => {
      const matchFilter = filter === 'all' || log.level === filter
      const matchSearch = log.message.toLowerCase().includes(search.toLowerCase())
      return matchFilter && matchSearch
    })
  }, [statusLog, filter, search])

  const exportLogs = () => {
    const text = statusLog.map(l => `[${l.timestamp}] ${l.level.toUpperCase()}: ${l.message}`).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `labs-gen-tik-${new Date().getTime()}.log`
    a.click()
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black">{t('pulse.title')}</h1>
          <p className="text-muted-foreground font-medium">{t('pulse.desc')}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportLogs} icon={Download}>{t('pulse.export')}</Button>
          <Button variant="danger" onClick={() => setStatusLog([])} icon={Trash2}>{t('pulse.clear')}</Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        {[
          { label: 'Total Logs', value: stats.total, color: 'text-foreground', icon: BarChart3 },
          { label: 'Success', value: stats.success, color: 'text-primary', icon: CheckCircle2 },
          { label: 'Warnings', value: stats.warn, color: 'text-warning', icon: AlertTriangle },
          { label: 'Errors', value: stats.error, color: 'text-destructive', icon: XCircle },
        ].map((s, i) => (
          <div key={i} className="p-4 rounded-3xl bg-secondary/30 border border-border light:bg-white/70 light:border-black/5 flex items-center gap-4">
            <div className={`p-2.5 rounded-xl bg-secondary ${s.color}`}><s.icon size={18} /></div>
            <div>
              <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{s.label}</div>
              <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <Card className="flex-1 flex flex-col min-h-0 p-0 overflow-hidden border-border/60">
        {/* Toolbar */}
        <div className="p-4 border-b border-border light:border-black/5 bg-secondary/20 light:bg-white/70 flex flex-col md:flex-row gap-4 justify-between items-center shrink-0">
          <div className="flex gap-1.5 p-1 bg-background/50 light:bg-white/70 rounded-2xl border border-border light:border-black/5">
            {['all', 'info', 'success', 'warn', 'error'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t(`pulse.filter_${f}`)}
              </button>
            ))}
          </div>
          <div className="w-full md:w-72">
            <Input 
              placeholder={t('pulse.search_placeholder')} 
              icon={Search} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 text-xs"
            />
          </div>
        </div>

        {/* Log List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[12px]">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-secondary/90 light:bg-white/90 backdrop-blur text-muted-foreground border-b border-border light:border-black/5">
              <tr>
                <th className="px-6 py-4 text-left font-black uppercase tracking-widest w-32">Timestamp</th>
                <th className="px-6 py-4 text-left font-black uppercase tracking-widest w-28">Level</th>
                <th className="px-6 py-4 text-left font-black uppercase tracking-widest">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 light:divide-black/5">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={log.id} 
                    className={`hover:bg-primary/5 transition-colors group ${
                      log.level === 'error' ? 'bg-destructive/5' : 
                      log.level === 'warn' ? 'bg-warning/5' : 
                      log.level === 'success' ? 'bg-primary/5' : ''
                    }`}
                  >
                    <td className="px-6 py-4 text-muted-foreground tabular-nums align-top font-medium">
                      {log.time}
                    </td>
                    <td className="px-6 py-4 align-top">
                      <LogBadge level={log.level} />
                    </td>
                    <td className="px-6 py-4 text-foreground leading-relaxed break-all font-medium">
                      <div className="flex items-start gap-2">
                        <ChevronRight size={14} className="mt-0.5 shrink-0 opacity-20 group-hover:text-primary group-hover:opacity-100 transition-all" />
                        <span>{log.message}</span>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Terminal size={48} />
                      <span className="font-black uppercase tracking-[0.3em]">{t('pulse.no_logs')}</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  )
}

export default Pulse
