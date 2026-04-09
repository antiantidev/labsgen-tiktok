import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Terminal, Search, Trash2, Download, AlertTriangle, XCircle, CheckCircle2, BarChart3, ChevronRight, ChevronLeft } from 'lucide-react'
import { Card, Button, Input } from '../components/ui'
import { LogBadge } from '../components/blocks'
import { useTranslation } from 'react-i18next'
import type { PulseLogLevel, PulsePageProps } from '../app/types'
import { pageVariants } from '../app/ui/pageMotion'
import { usePulseUiStore } from '../stores'

const Pulse = ({ statusLog = [], setStatusLog, logPage = 1, logPageSize = 100, logTotal = 0, loadLogs, clearLogs }: PulsePageProps) => {
  const { t } = useTranslation()
  const filter = usePulseUiStore((state) => state.filter) as 'all' | PulseLogLevel
  const setFilter = usePulseUiStore((state) => state.setFilter)
  const search = usePulseUiStore((state) => state.search)
  const setSearch = usePulseUiStore((state) => state.setSearch)

  const stats = useMemo(
    () => ({
      total: statusLog.length,
      error: statusLog.filter((l) => l.level === 'error').length,
      warn: statusLog.filter((l) => l.level === 'warn').length,
      success: statusLog.filter((l) => l.level === 'success').length
    }),
    [statusLog]
  )

  const filteredLogs = useMemo(() => {
    return statusLog.filter((log) => {
      const matchFilter = filter === 'all' || log.level === filter
      const matchSearch = log.message.toLowerCase().includes(search.toLowerCase())
      return matchFilter && matchSearch
    })
  }, [statusLog, filter, search])

  const exportLogs = () => {
    const text = statusLog.map((l) => `[${l.timestamp}] ${l.level.toUpperCase()}: ${l.message}`).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `labsgen-tiktok-${new Date().getTime()}.log`
    a.click()
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('pulse.title')}</h1>
          <p className="text-sm font-medium text-muted-foreground">{t('pulse.desc')}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportLogs} icon={Download} className="font-bold">
            {t('pulse.export')}
          </Button>
          <Button variant="danger" onClick={() => void clearLogs()} icon={Trash2} className="font-bold">
            {t('pulse.clear')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        {[
          { label: 'Total', value: stats.total, color: 'text-foreground', icon: BarChart3 },
          { label: 'Success', value: stats.success, color: 'text-success', icon: CheckCircle2 },
          { label: 'Warnings', value: stats.warn, color: 'text-warning', icon: AlertTriangle },
          { label: 'Errors', value: stats.error, color: 'text-destructive', icon: XCircle }
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-foreground/[0.02]">
            <div className={`p-2 rounded-full bg-foreground/5 ${s.color}`}>
              <s.icon size={16} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">{s.label}</div>
              <div className={`text-lg font-bold tracking-tight tabular-nums ${s.color}`}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <Card className="flex-1 flex flex-col min-h-0 p-0 overflow-hidden border-border/80 shadow-2xl bg-secondary/20">
        <div className="px-5 py-4 border-b border-border/50 flex flex-col lg:flex-row gap-4 justify-between items-center shrink-0">
          <div className="flex gap-1 p-1 bg-foreground/[0.03] rounded-xl border border-border/50">
            {(['all', 'info', 'success', 'warn', 'error'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-tight transition-all duration-200 ${filter === f ? 'bg-foreground text-background shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'}`}
              >
                {t(`pulse.filter_${f}`)}
              </button>
            ))}
          </div>
          <div className="w-full lg:w-72">
            <Input placeholder={t('pulse.search_placeholder')} icon={Search} value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 text-sm bg-foreground/[0.02]" />
          </div>
        </div>

        <div className="px-5 py-3 border-b border-border/40 flex items-center justify-between bg-foreground/[0.01]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 tabular-nums">
            {t('pulse.page')} {logPage} / {Math.max(1, Math.ceil(logTotal / logPageSize))}
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => void loadLogs(Math.max(1, logPage - 1))} disabled={logPage <= 1} className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest" icon={ChevronLeft}>
              {t('pulse.prev')}
            </Button>
            <Button
              variant="ghost"
              onClick={() => void loadLogs(Math.min(Math.max(1, Math.ceil(logTotal / logPageSize)), logPage + 1))}
              disabled={logPage >= Math.max(1, Math.ceil(logTotal / logPageSize))}
              className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest"
              icon={ChevronRight}
            >
              {t('pulse.next')}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto font-mono text-[11px] selection:bg-foreground selection:text-background">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/60 text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest w-36">Timestamp</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest w-24">Level</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="group hover:bg-foreground/[0.03] transition-colors"
                  >
                    <td className="px-5 py-3 text-muted-foreground/60 tabular-nums align-top font-medium tracking-tight whitespace-nowrap">{log.time}</td>
                    <td className="px-5 py-3 align-top">
                      <LogBadge level={log.level} />
                    </td>
                    <td className="px-5 py-3 text-foreground/80 leading-relaxed break-all font-medium">{log.message}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-muted-foreground/40">
                      <div className="p-5 rounded-full bg-foreground/[0.02] border border-border/20">
                        <Terminal size={32} className="opacity-20" />
                      </div>
                      <span className="text-sm font-bold uppercase tracking-widest opacity-40">{t('pulse.no_logs')}</span>
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
