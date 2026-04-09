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
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{t('console.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('console.desc')}</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium ${streamData.isLive ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-muted-foreground'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${streamData.isLive ? 'bg-destructive animate-pulse' : 'bg-muted-foreground'}`} />
          {streamData.isLive ? t('console.on_air') : t('console.offline')}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-4">
          <Card title={t('console.ingest')}>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">{t('console.server_url')}</label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-secondary rounded-md px-3 py-2 text-sm font-mono text-foreground truncate">
                    {streamData.url || t('console.not_started')}
                  </div>
                  <Button variant="secondary" onClick={() => copyToClipboard(streamData.url, t('console.rtmp_url'))} disabled={!streamData.url} className="px-3">
                    <Copy size={14} />
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">{t('console.stream_key')}</label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-secondary rounded-md px-3 py-2 text-sm font-mono text-foreground">
                    {streamData.key ? '••••••••••••••••••••••••' : t('console.not_started')}
                  </div>
                  <Button variant="secondary" onClick={() => copyToClipboard(streamData.key, t('console.stream_key_label'))} disabled={!streamData.key} className="px-3">
                    <Copy size={14} />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card title={t('console.monitor')}>
              <div className="flex items-center gap-3 py-2">
                <Radio size={18} className={streamData.isLive ? 'text-success' : 'text-muted-foreground'} />
                <div>
                  <div className="text-xs text-muted-foreground">{t('console.health')}</div>
                  <div className="text-sm font-medium">{streamData.isLive ? t('console.excellent') : t('console.na')}</div>
                </div>
              </div>
            </Card>

            <Card title={t('console.quick_info')}>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground text-xs">{t('console.platform')}</span>
                  <span className="font-medium text-xs">{t('console.platform_value')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground text-xs">{t('console.active_setup')}</span>
                  <span className="font-medium text-xs truncate max-w-[120px]">{streamTitle || t('console.default_title')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground text-xs">{t('console.category')}</span>
                  <span className="font-medium text-xs truncate max-w-[120px]">{gameCategory || t('console.none')}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-4">
          <Card title={t('console.live_action')}>
            <div className="space-y-3">
              <Button 
                onClick={handleGoLive} 
                disabled={!canGoLive || streamData.isLive} 
                className="w-full py-3" 
                icon={Play}
              >
                {t('console.go_live')}
              </Button>
              <Button 
                variant="danger" 
                onClick={endStream} 
                disabled={!streamData.isLive} 
                className="w-full py-3" 
                icon={Square}
              >
                {t('console.end_session')}
              </Button>
            </div>
            
            <div className="mt-4 p-3 rounded-md bg-warning/5 border border-warning/10 space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="text-warning" size={14} />
                <span className="text-xs font-medium text-warning">{t('console.checklist')}</span>
              </div>
              <ul className="space-y-1">
                {[
                  t('console.checklist_items.launch'),
                  t('console.checklist_items.copy'),
                  t('console.checklist_items.verify'),
                  t('console.checklist_items.start')
                ].map((item, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <Button 
            variant="outline" 
            onClick={() => api.openExternal("https://livecenter.tiktok.com/live_monitor")}
            className="w-full"
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
