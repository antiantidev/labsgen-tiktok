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
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-semibold">{t('pulse.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('pulse.desc')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportLogs} icon={Download}>
            {t('pulse.export')}
          </Button>
          <Button variant="danger" onClick={() => void clearLogs()} icon={Trash2}>
            {t('pulse.clear')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 shrink-0">
        {[
          { label: 'Total', value: stats.total, color: 'text-foreground', icon: BarChart3 },
          { label: 'Success', value: stats.success, color: 'text-success', icon: CheckCircle2 },
          { label: 'Warnings', value: stats.warn, color: 'text-warning', icon: AlertTriangle },
          { label: 'Errors', value: stats.error, color: 'text-destructive', icon: XCircle }
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-2.5 p-3 rounded-md border border-border">
            <s.icon size={14} className={s.color} />
            <div>
              <div className="text-2xs text-muted-foreground">{s.label}</div>
              <div className={`text-sm font-semibold tabular-nums ${s.color}`}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <Card className="flex-1 flex flex-col min-h-0 p-0 overflow-hidden min-h-[300px] max-h-[calc(100vh-320px)]">
        <div className="px-3 py-2 border-b border-border flex flex-col md:flex-row gap-2 justify-between items-center shrink-0">
          <div className="flex gap-0.5 p-0.5 bg-secondary rounded-md">
            {(['all', 'info', 'success', 'warn', 'error'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${filter === f ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t(`pulse.filter_${f}`)}
              </button>
            ))}
          </div>
          <div className="w-full md:w-56">
            <Input placeholder={t('pulse.search_placeholder')} icon={Search} value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 text-xs" />
          </div>
        </div>

        <div className="px-3 py-2 border-b border-border flex items-center justify-between">
          <span className="text-2xs text-muted-foreground tabular-nums">
            {t('pulse.page')} {logPage} / {Math.max(1, Math.ceil(logTotal / logPageSize))}
          </span>
          <div className="flex gap-1">
            <Button variant="ghost" onClick={() => void loadLogs(Math.max(1, logPage - 1))} disabled={logPage <= 1} className="h-7 px-2 text-xs" icon={ChevronLeft}>
              {t('pulse.prev')}
            </Button>
            <Button
              variant="ghost"
              onClick={() => void loadLogs(Math.min(Math.max(1, Math.ceil(logTotal / logPageSize)), logPage + 1))}
              disabled={logPage >= Math.max(1, Math.ceil(logTotal / logPageSize))}
              className="h-7 px-2 text-xs"
              icon={ChevronRight}
            >
              {t('pulse.next')}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto font-mono text-xs">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-background border-b border-border text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left text-2xs font-medium w-28">Timestamp</th>
                <th className="px-3 py-2 text-left text-2xs font-medium w-20">Level</th>
                <th className="px-3 py-2 text-left text-2xs font-medium">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-secondary/50 transition-colors"
                  >
                    <td className="px-3 py-2 text-muted-foreground tabular-nums align-top">{log.time}</td>
                    <td className="px-3 py-2 align-top">
                      <LogBadge level={log.level} />
                    </td>
                    <td className="px-3 py-2 text-foreground leading-relaxed break-all">{log.message}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Terminal size={20} className="opacity-30" />
                      <span className="text-xs opacity-50">{t('pulse.no_logs')}</span>
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
