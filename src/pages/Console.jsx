import React from 'react'
import { motion } from 'framer-motion'
import { Play, Square, Copy, AlertCircle, Monitor, Radio } from 'lucide-react'
import { Card, Button } from '../components/ui'
import { useTranslation } from 'react-i18next'

const pageVariants = {
  initial: { opacity: 0, y: 10, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -10, filter: 'blur(10px)', transition: { duration: 0.2 } }
}

const Console = ({ 
  streamData, startStream, endStream, canGoLive, streamTitle, gameCategory, pushToast
}) => {
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

  const copyToClipboard = async (text, label) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      if (pushToast) pushToast(`${label} ${t('console.copy_success')}`, 'success')
    } catch (err) {
      if (pushToast) pushToast(t('console.copy_failed'), 'error')
    }
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black">{t('console.title')}</h1>
          <p className="text-muted-foreground font-medium">{t('console.desc')}</p>
        </div>
        <div className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border transition-all duration-500 ${streamData.isLive ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.15)]' : 'bg-secondary border-border text-muted-foreground'}`}>
          <motion.div 
            animate={streamData.isLive ? { scale: [1, 1.5, 1], opacity: [1, 0.5, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className={`w-2 h-2 rounded-full ${streamData.isLive ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-muted-foreground'}`} 
          />
          {streamData.isLive ? t('console.on_air') : t('console.offline')}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-8 space-y-10">
          <Card title={t('console.ingest')}>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest ml-1">{t('console.server_url')}</label>
                <div className="grid grid-cols-[1fr_auto] gap-3">
                  <div className="bg-secondary border border-border rounded-xl px-6 py-4 text-[13px] font-mono font-medium text-foreground overflow-hidden truncate flex items-center">
                    {streamData.url || t('console.not_started')}
                  </div>
                  <Button variant="secondary" onClick={() => copyToClipboard(streamData.url, t('console.rtmp_url'))} className="h-[56px] w-[56px] p-0" disabled={!streamData.url}>
                    <Copy size={20} />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest ml-1">{t('console.stream_key')}</label>
                <div className="grid grid-cols-[1fr_auto] gap-3">
                  <div className="bg-secondary border border-border rounded-xl px-6 py-4 text-[13px] font-mono font-medium text-foreground overflow-hidden flex items-center">
                    {streamData.key ? '••••••••••••••••••••••••••••••••••••' : t('console.not_started')}
                  </div>
                  <Button variant="secondary" onClick={() => copyToClipboard(streamData.key, t('console.stream_key_label'))} className="h-[56px] w-[56px] p-0" disabled={!streamData.key}>
                    <Copy size={20} />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <Card title={t('console.monitor')}>
              <div className="flex flex-col items-center justify-center py-6 space-y-4">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-colors ${streamData.isLive ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                  <Radio size={32} className={streamData.isLive ? 'animate-pulse' : ''} />
                </div>
                <div className="text-center">
                  <div className="text-xs font-black uppercase tracking-widest mb-1">{t('console.health')}</div>
                  <div className="text-xl font-bold">{streamData.isLive ? t('console.excellent') : t('console.na')}</div>
                </div>
              </div>
            </Card>

            <Card title={t('console.quick_info')}>
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{t('console.platform')}</span>
                  <span className="text-sm font-bold">{t('console.platform_value')}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{t('console.active_setup')}</span>
                  <span className="text-sm font-bold truncate">{streamTitle || t('console.default_title')}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{t('console.category')}</span>
                  <span className="text-sm font-bold truncate">{gameCategory || t('console.none')}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-10">
          <Card title={t('console.live_action')} className="bg-primary/5">
            <div className="space-y-4">
              <Button 
                onClick={handleGoLive} 
                disabled={!canGoLive || streamData.isLive} 
                className="w-full py-6 text-sm shadow-[0_10px_30px_rgba(49,251,154,0.2)]" 
                icon={Play}
              >
                {t('console.go_live')}
              </Button>
              <Button 
                variant="danger" 
                onClick={endStream} 
                disabled={!streamData.isLive} 
                className="w-full py-6 text-sm" 
                icon={Square}
              >
                {t('console.end_session')}
              </Button>
            </div>
            
            <div className="mt-8 p-6 rounded-[32px] bg-amber-500/10 border border-amber-500/20 space-y-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-amber-500" size={20} />
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{t('console.checklist')}</span>
              </div>
              <ul className="space-y-2">
                {[
                  t('console.checklist_items.launch'),
                  t('console.checklist_items.copy'),
                  t('console.checklist_items.verify'),
                  t('console.checklist_items.start')
                ].map((item, i) => (
                  <li key={i} className="text-[11px] text-muted-foreground font-bold flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500/40" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <Button 
            variant="secondary" 
            onClick={() => window.api.openExternal("https://livecenter.tiktok.com/live_monitor")}
            className="w-full py-4 h-auto flex-col gap-2 rounded-[32px]"
          >
            <Monitor size={24} />
            <span className="text-[10px] font-black uppercase">{t('console.open_monitor')}</span>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export default Console
