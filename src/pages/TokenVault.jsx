import React from 'react'
import { motion } from 'framer-motion'
import { Key, HardDrive, Globe, RefreshCw, Save, Eye, EyeOff, ShieldCheck, ShieldAlert, User, Trash2, CheckCircle2 } from 'lucide-react'
import { Card, Button } from '../components/ui'
import { useTranslation } from 'react-i18next'

const pageVariants = {
  initial: { opacity: 0, y: 10, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -10, filter: 'blur(10px)', transition: { duration: 0.2 } }
}

const TokenVault = ({ 
  token, showToken, setShowToken, loadLocalToken, loadWebToken, isWebLoading, refreshAccountInfo, saveConfig,
  canGoLive, status, accounts = [], selectAccount, deleteAccount, activeAccountId
}) => {
  const { t } = useTranslation()

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">{t('tokens.title')}</h1>
          <p className="text-muted-foreground font-medium">{t('tokens.desc')}</p>
        </div>
        <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border ${canGoLive ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
          {canGoLive ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
          {canGoLive ? t('tokens.verified') : t('tokens.restricted')}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Saved Accounts Section */}
          <Card title={t('tokens.saved_accounts') || 'Saved Accounts'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sort: Web accounts first, then Local imports */}
              {[...accounts].sort((a, b) => (a.type === 'web' ? -1 : 1)).map((acc) => (
                <div 
                  key={acc.id} 
                  className={`p-5 rounded-3xl border transition-all group relative overflow-hidden ${activeAccountId === acc.id ? 'bg-primary/5 border-primary/30' : 'bg-secondary border-border hover:border-primary/20'}`}
                >
                  <div className="flex items-start justify-between relative z-10 gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`p-2.5 rounded-2xl relative shrink-0 mt-0.5 ${activeAccountId === acc.id ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground'}`}>
                        <User size={18} />
                        <div className="absolute -top-1 -right-1">
                          {acc.type === 'local' ? (
                            <div className="bg-amber-500 rounded-full p-0.5 border border-background shadow-lg" title={t('tokens.local_fetch')}>
                              <HardDrive size={6} className="text-white" />
                            </div>
                          ) : (
                            <div className="bg-blue-500 rounded-full p-0.5 border border-background shadow-lg" title={t('tokens.web_capture')}>
                              <Globe size={6} className="text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-black text-[13px] leading-tight break-words pr-1 text-foreground">
                          {acc.name}
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          <span className={`text-[6px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter shrink-0 ${acc.type === 'local' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                            {acc.type || 'web'}
                          </span>
                          <span className="text-[10px] text-primary font-black break-all italic">
                            {acc.username ? `@${acc.username.replace('@', '')}` : '---'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0 bg-background/50 p-1 rounded-2xl border border-border/50">
                      {activeAccountId !== acc.id ? (
                        <button 
                          onClick={() => selectAccount(acc.id)}
                          className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                          title="Apply"
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      ) : (
                        <div className="p-2 rounded-xl text-primary bg-primary/10">
                          <ShieldCheck size={14} />
                        </div>
                      )}
                      <button 
                        onClick={() => deleteAccount(acc.id)}
                        className="p-2 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {activeAccountId === acc.id && (
                    <div className="absolute -right-2 -bottom-2 opacity-10 text-primary">
                      <ShieldCheck size={64} />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Add New Account via Web */}
              <button 
                onClick={() => loadWebToken()}
                disabled={isWebLoading}
                className="p-5 rounded-3xl border border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-primary/40 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary group h-full min-h-[100px]"
              >
                <Globe size={24} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">{t('tokens.web_capture')}</span>
              </button>
            </div>
          </Card>

          <Card title={t('tokens.active')}>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">{t('tokens.session_token')}</label>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-secondary border border-border rounded-2xl px-6 py-4 text-xs font-mono text-muted-foreground break-all min-h-[56px] flex items-center">
                    {token ? (showToken ? token : '••••••••' + token.slice(-16)) : t('tokens.no_token')}
                  </div>
                  <Button variant="secondary" onClick={() => setShowToken(!showToken)} className="h-14 w-14 p-0">
                    {showToken ? <EyeOff size={20} /> : <Eye size={20} />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="p-6 rounded-3xl bg-secondary border border-border space-y-4">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary w-fit"><HardDrive size={24} /></div>
                  <div>
                    <h4 className="font-black text-sm uppercase">{t('tokens.local_fetch')}</h4>
                    <p className="text-[11px] text-muted-foreground mt-1">{t('tokens.local_desc')}</p>
                  </div>
                  <Button variant="outline" className="w-full" onClick={loadLocalToken}>{t('tokens.fetch_pc')}</Button>
                </div>

                <div className="p-6 rounded-3xl bg-secondary border border-border space-y-4">
                  <div className="p-3 rounded-2xl bg-blue-400/10 text-blue-400 w-fit"><Globe size={24} /></div>
                  <div>
                    <h4 className="font-black text-sm uppercase">{t('tokens.web_capture')}</h4>
                    <p className="text-[11px] text-muted-foreground mt-1">{t('tokens.web_desc')}</p>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => loadWebToken()} loading={isWebLoading}>{t('tokens.launch_browser')}</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card title={t('tokens.account_context')}>
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{t('tokens.username')}</span>
                  <span className="text-lg font-bold">{status.username === 'Guest' ? t('tokens.guest') : status.username}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{t('tokens.live_status')}</span>
                  <span className="text-lg font-bold">{t(status.appStatus)}</span>
                </div>
                <div className="pt-2">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">{t('tokens.permission')}</span>
                  <div className={`p-4 rounded-2xl border font-black text-[10px] tracking-widest text-center ${canGoLive ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-rose-500/5 border-rose-500/20 text-rose-500'}`}>
                    {canGoLive ? t('tokens.full_rights') : t('tokens.restricted_rights')}
                  </div>
                </div>
              </div>

              <div className="divider-x opacity-10" />

              <div className="grid gap-3">
                <Button onClick={() => refreshAccountInfo()} icon={RefreshCw} className="w-full">{t('tokens.sync')}</Button>
                <Button variant="secondary" onClick={() => saveConfig(true)} icon={Save} className="w-full">{t('tokens.save_local')}</Button>
              </div>
            </div>
          </Card>

          <Card title={t('tokens.security_tip_title')}>
            <div className="flex gap-4">
              <Key className="text-primary shrink-0" size={20} />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {t('tokens.security_tip')}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}

export default TokenVault
