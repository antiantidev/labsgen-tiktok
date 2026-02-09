import React from 'react'
import { motion } from 'framer-motion'
import { Key, HardDrive, Globe, RefreshCw, Save, Eye, EyeOff, ShieldCheck, ShieldAlert } from 'lucide-react'
import { Card, Button } from '../components/ui'

const pageVariants = {
  initial: { opacity: 0, y: 10, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -10, filter: 'blur(10px)', transition: { duration: 0.2 } }
}

const TokenVault = ({ 
  token, showToken, setShowToken, loadLocalToken, loadWebToken, isWebLoading, refreshAccountInfo, saveConfig,
  canGoLive, status
}) => (
  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-black">Token Vault</h1>
        <p className="text-muted-foreground font-medium">Manage your TikTok authentication credentials.</p>
      </div>
      <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border ${canGoLive ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
        {canGoLive ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
        {canGoLive ? 'Access Verified' : 'Access Restricted'}
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <Card title="Active Credentials">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Current Session Token</label>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-xs font-mono text-zinc-400 break-all min-h-[56px] flex items-center">
                  {token ? (showToken ? token : '••••••••' + token.slice(-16)) : 'No token currently loaded'}
                </div>
                <Button variant="secondary" onClick={() => setShowToken(!showToken)} className="h-14 w-14 p-0">
                  {showToken ? <EyeOff size={20} /> : <Eye size={20} />}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary w-fit"><HardDrive size={24} /></div>
                <div>
                  <h4 className="font-black text-sm uppercase">Local Fetch</h4>
                  <p className="text-[11px] text-muted-foreground mt-1">Retrieve token from TikTok Desktop app data on your computer.</p>
                </div>
                <Button variant="outline" className="w-full" onClick={loadLocalToken}>Fetch from PC</Button>
              </div>

              <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                <div className="p-3 rounded-2xl bg-blue-400/10 text-blue-400 w-fit"><Globe size={24} /></div>
                <div>
                  <h4 className="font-black text-sm uppercase">Web Capture</h4>
                  <p className="text-[11px] text-muted-foreground mt-1">Open a secure browser window to login and capture the token.</p>
                </div>
                <Button variant="outline" className="w-full" onClick={loadWebToken} loading={isWebLoading}>Launch Browser</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-8">
        <Card title="Account Context">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Username</span>
                <span className="text-lg font-bold">{status.username}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Live Status</span>
                <span className="text-lg font-bold">{status.appStatus}</span>
              </div>
              <div className="pt-2">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">Permission Check</span>
                <div className={`p-4 rounded-2xl border font-black text-[10px] tracking-widest text-center ${canGoLive ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-rose-500/5 border-rose-500/20 text-rose-500'}`}>
                  {canGoLive ? 'FULL STREAMING RIGHTS' : 'STREAMING RESTRICTED'}
                </div>
              </div>
            </div>

            <div className="divider-x opacity-10" />

            <div className="grid gap-3">
              <Button onClick={() => refreshAccountInfo()} icon={RefreshCw} className="w-full">Sync Account</Button>
              <Button variant="secondary" onClick={() => saveConfig(true)} icon={Save} className="w-full">Save to Local</Button>
            </div>
          </div>
        </Card>

        <Card title="Security Tip">
          <div className="flex gap-4">
            <Key className="text-primary shrink-0" size={20} />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Tokens are stored locally on your machine. Never share your token with anyone as it provides full access to your TikTok LIVE controls.
            </p>
          </div>
        </Card>
      </div>
    </div>
  </motion.div>
)

export default TokenVault
