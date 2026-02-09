import React from 'react'
import { motion } from 'framer-motion'
import { Play, Square, Copy, AlertCircle, Monitor, Radio } from 'lucide-react'
import { Card, Button } from '../components/ui'

const pageVariants = {
  initial: { opacity: 0, y: 10, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -10, filter: 'blur(10px)', transition: { duration: 0.2 } }
}

const Console = ({ 
  streamData, startStream, endStream, canGoLive, streamTitle, gameCategory
}) => (
  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-10">
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h1 className="text-3xl font-black">Broadcast</h1>
        <p className="text-muted-foreground font-medium">Control your live session and manage stream endpoints.</p>
      </div>
      <div className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border transition-all duration-500 ${streamData.isLive ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.15)]' : 'bg-white/5 border-white/10 text-muted-foreground'}`}>
        <motion.div 
          animate={streamData.isLive ? { scale: [1, 1.5, 1], opacity: [1, 0.5, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className={`w-2 h-2 rounded-full ${streamData.isLive ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-muted-foreground'}`} 
        />
        {streamData.isLive ? 'On Air' : 'Offline'}
      </div>
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
      <div className="xl:col-span-8 space-y-10">
        <Card title="Streaming Ingest">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Server Endpoint (RTMP URL)</label>
              <div className="grid grid-cols-[1fr_auto] gap-3">
                <div className="bg-black/60 border border-white/5 rounded-2xl px-6 py-4 text-xs font-mono text-zinc-400 overflow-hidden truncate flex items-center">
                  {streamData.url || 'Session not started'}
                </div>
                <Button variant="secondary" onClick={() => streamData.url && navigator.clipboard.writeText(streamData.url)} className="h-[56px] w-[56px] p-0">
                  <Copy size={20} />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Stream Key</label>
              <div className="grid grid-cols-[1fr_auto] gap-3">
                <div className="bg-black/60 border border-white/5 rounded-2xl px-6 py-4 text-xs font-mono text-zinc-400 overflow-hidden flex items-center">
                  {streamData.key ? '••••••••••••••••••••••••••••••••••••' : 'Session not started'}
                </div>
                <Button variant="secondary" onClick={() => streamData.key && navigator.clipboard.writeText(streamData.key)} className="h-[56px] w-[56px] p-0">
                  <Copy size={20} />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Card title="Session Monitor">
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-colors ${streamData.isLive ? 'bg-primary/10 text-primary' : 'bg-white/5 text-muted-foreground'}`}>
                <Radio size={32} className={streamData.isLive ? 'animate-pulse' : ''} />
              </div>
              <div className="text-center">
                <div className="text-xs font-black uppercase tracking-widest mb-1">Health</div>
                <div className="text-xl font-bold">{streamData.isLive ? 'Excellent' : '---'}</div>
              </div>
            </div>
          </Card>

          <Card title="Quick Info">
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Target Platform</span>
                <span className="text-sm font-bold">TikTok LIVE</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Active Setup</span>
                <span className="text-sm font-bold truncate">{streamTitle || 'Default Title'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Category</span>
                <span className="text-sm font-bold truncate">{gameCategory || 'None'}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="xl:col-span-4 space-y-10">
        <Card title="Live Action" className="bg-white/[0.02]">
          <div className="space-y-4">
            <Button 
              onClick={startStream} 
              disabled={!canGoLive || streamData.isLive} 
              className="w-full py-6 text-sm shadow-[0_10px_30px_rgba(49,251,154,0.2)]" 
              icon={Play}
            >
              Go Live Now
            </Button>
            <Button 
              variant="danger" 
              onClick={endStream} 
              disabled={!streamData.isLive} 
              className="w-full py-6 text-sm" 
              icon={Square}
            >
              End Session
            </Button>
          </div>
          
          <div className="mt-8 p-6 rounded-[32px] bg-amber-500/5 border border-amber-500/10 space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-amber-500" size={20} />
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Checklist</span>
            </div>
            <ul className="space-y-2">
              {['Launch OBS/Streamlabs', 'Copy URL and Key', 'Verify Scenes', 'Start Stream in OBS'].map((item, i) => (
                <li key={i} className="text-[11px] text-zinc-500 font-medium flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-amber-500/30" />
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
          <span className="text-[10px] font-black uppercase">Open TikTok Monitor</span>
        </Button>
      </div>
    </div>
  </motion.div>
)

export default Console
