import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Terminal } from 'lucide-react'
import { Card, Button } from '../components/ui'
import { useTranslation } from 'react-i18next'

const pageVariants = {
  initial: { opacity: 0, y: 10, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -10, filter: 'blur(10px)', transition: { duration: 0.2 } }
}

const Pulse = ({ statusLog, setStatusLog }) => {
  const { t } = useTranslation()

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">{t('sidebar.system_pulse')}</h1>
          <p className="text-muted-foreground font-medium">{t('pulse.desc')}</p>
        </div>
        <Button variant="ghost" onClick={() => setStatusLog([])} className="hover:text-rose-400">{t('pulse.clear_logs')}</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Cloud API', status: t('pulse.status.active'), color: 'bg-primary' },
          { label: 'RTMP Ingest', status: t('pulse.status.stable'), color: 'bg-primary' },
          { label: 'Auth Gateway', status: t('pulse.status.optimal'), color: 'bg-primary' },
          { label: 'Session Relay', status: t('pulse.status.standby'), color: 'bg-blue-400' }
        ].map((item, i) => (
          <Card key={i} className="py-4">
            <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2">{item.label}</div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${item.color}`} />
              <span className="text-sm font-bold">{item.status}</span>
            </div>
          </Card>
        ))}
      </div>

      <motion.div layout className="flex-1 glass border border-border rounded-3xl flex flex-col min-h-0 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-blue-500/50 to-primary/50 opacity-20" />
        <div className="p-5 border-b border-border flex items-center justify-between bg-secondary">
          <div className="flex items-center gap-3">
            <Activity size={18} className="text-primary" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">{t('pulse.activity_stream')}</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 font-mono text-[12px] space-y-4 custom-scrollbar">
          <AnimatePresence initial={false}>
            {statusLog.map((log) => (
              <motion.div key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-6 group">
                <span className="text-zinc-600 shrink-0 font-bold">{log.time}</span>
                <span className="text-muted-foreground group-hover:text-primary transition-colors leading-relaxed">{log.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          {statusLog.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/30 space-y-4 italic">
              <Terminal size={48} className="opacity-20" />
              <p className="text-sm">{t('pulse.listening')}</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Pulse
