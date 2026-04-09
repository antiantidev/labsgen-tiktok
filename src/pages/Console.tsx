import React from 'react'
import { motion } from 'framer-motion'
import { Play, Square, Copy, AlertCircle, Monitor, Radio } from 'lucide-react'
import { Card, Button } from '../components/ui'
import { useTranslation } from 'react-i18next'
import type { ConsolePageProps } from '../app/types'
import { pageVariants } from '../app/ui/pageMotion'
import { useApiBridge } from '../hooks'

const Console = ({
  streamData, startStream, endStream, canGoLive, streamTitle, gameCategory, pushToast
}: ConsolePageProps) => {
  const api = useApiBridge()
  const { t } = useTranslation()

  const handleGoLive = () => {
    const titleOk = typeof streamTitle === 'string' && streamTitle.trim().length > 0
    const categoryOk = typeof gameCategory === 'string' && gameCategory.trim().length > 0
    if (!titleOk || !categoryOk) {
      if (pushToast) pushToast(t('console.missing_metadata'), 'error')
      return
    }
    startStream()
  }

  const copyToClipboard = async (text: string, label: string) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      if (pushToast) pushToast(`${label} ${t('console.copy_success')}`, 'success')
    } catch (err) {
      if (pushToast) pushToast(t('console.copy_failed'), 'error')
    }
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('console.title')}</h1>
          <p className="text-sm font-medium text-muted-foreground">{t('console.desc')}</p>
        </div>
        <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest ${streamData.isLive ? 'bg-destructive/10 text-destructive border border-destructive/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-secondary border border-border text-muted-foreground/60'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${streamData.isLive ? 'bg-destructive animate-pulse' : 'bg-muted-foreground/40'}`} />
          {streamData.isLive ? t('console.on_air') : t('console.offline')}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-8">
          <Card title={t('console.ingest')}>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 focus-within:text-foreground transition-colors">{t('console.server_url')}</label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-foreground/[0.03] border border-border/50 rounded-lg px-4 py-3 text-sm font-mono text-foreground truncate select-all leading-none h-12 flex items-center">
                    {streamData.url || t('console.not_started')}
                  </div>
                  <Button variant="secondary" onClick={() => copyToClipboard(streamData.url, t('console.rtmp_url'))} disabled={!streamData.url} className="px-4 h-12 shadow-lg shadow-foreground/5">
                    <Copy size={16} />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 focus-within:text-foreground transition-colors">{t('console.stream_key')}</label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-foreground/[0.03] border border-border/50 rounded-lg px-4 py-3 text-sm font-mono text-foreground flex items-center h-12">
                    {streamData.key ? '••••••••••••••••••••••••' : t('console.not_started')}
                  </div>
                  <Button variant="secondary" onClick={() => copyToClipboard(streamData.key, t('console.stream_key_label'))} disabled={!streamData.key} className="px-4 h-12 shadow-lg shadow-foreground/5">
                    <Copy size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card title={t('console.monitor')}>
              <div className="flex items-center gap-4 py-1">
                <div className={`p-3.5 rounded-full ${streamData.isLive ? 'bg-success/10 text-success' : 'bg-foreground/5 text-muted-foreground/40'}`}>
                  <Radio size={20} className={streamData.isLive ? 'animate-pulse' : ''} />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">{t('console.health')}</div>
                  <div className="text-xl font-bold tracking-tight">{streamData.isLive ? t('console.excellent') : t('console.na')}</div>
                </div>
              </div>
            </Card>

            <Card title={t('console.quick_info')}>
              <div className="space-y-4 pt-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground/60 font-bold text-[10px] uppercase tracking-widest">{t('console.platform')}</span>
                  <span className="font-bold tracking-tight">{t('console.platform_value')}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-1 border-t border-border/40">
                  <span className="text-muted-foreground/60 font-bold text-[10px] uppercase tracking-widest">{t('console.active_setup')}</span>
                  <span className="font-bold tracking-tight truncate max-w-[140px]">{streamTitle || t('console.default_title')}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-1 border-t border-border/40">
                  <span className="text-muted-foreground/60 font-bold text-[10px] uppercase tracking-widest">{t('console.category')}</span>
                  <span className="font-bold tracking-tight truncate max-w-[140px]">{gameCategory || t('console.none')}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-6">
          <Card title={t('console.live_action')}>
            <div className="space-y-4">
              <Button
                onClick={handleGoLive}
                disabled={!canGoLive || streamData.isLive}
                className="w-full h-14 text-base font-bold shadow-xl shadow-foreground/5"
                icon={Play}
              >
                {t('console.go_live')}
              </Button>
              <Button
                variant="danger"
                onClick={endStream}
                disabled={!streamData.isLive}
                className="w-full h-12 text-sm font-bold opacity-80 hover:opacity-100"
                icon={Square}
              >
                {t('console.end_session')}
              </Button>
            </div>

            <div className="mt-8 p-5 rounded-xl bg-warning/5 border border-warning/10 space-y-4">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="text-warning" size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-warning">{t('console.checklist')}</span>
              </div>
              <ul className="space-y-3.5">
                {[
                  t('console.checklist_items.launch'),
                  t('console.checklist_items.copy'),
                  t('console.checklist_items.verify'),
                  t('console.checklist_items.start')
                ].map((item, i) => (
                  <li key={i} className="text-xs font-semibold text-muted-foreground/80 flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-warning/10 text-warning flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                    <span className="leading-relaxed pt-0.5">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <Button
            variant="outline"
            onClick={() => api.openExternal("https://livecenter.tiktok.com/live_monitor")}
            className="w-full h-11 font-bold text-xs uppercase tracking-widest shadow-lg shadow-foreground/5"
            icon={Monitor}
          >
            {t('console.open_monitor')}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export default Console
