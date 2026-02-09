import React from 'react'
import { motion } from 'framer-motion'
import { Key, HardDrive, Globe, RefreshCw, Save, Eye, EyeOff, ShieldCheck, ShieldAlert, User, Trash2, CheckCircle2 } from 'lucide-react'
import { Card, Button, Skeleton } from '../components/ui'
import { useTranslation } from 'react-i18next'

const pageVariants = {
  initial: { opacity: 0, y: 10, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -10, filter: 'blur(10px)', transition: { duration: 0.2 } }
}

const TokenVault = ({ 
  loadLocalToken, loadWebToken, isWebLoading, refreshAccountInfo, saveConfig,
  canGoLive, status, accounts = [], selectAccount, deleteAccount, activeAccountId, isLoading
}) => {
  const { t } = useTranslation()

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">{t('tokens.title')}</h1>
          <p className="text-muted-foreground font-medium">{t('tokens.desc')}</p>
        </div>
        {isLoading ? (
          <Skeleton className="h-8 w-40 rounded-full" />
        ) : (
          <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border ${canGoLive ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
            {canGoLive ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
            {canGoLive ? t('tokens.verified') : t('tokens.restricted')}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Managed Accounts Section */}
          <Card title={t('tokens.saved_accounts')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading && accounts.length === 0 ? (
                [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[110px] w-full rounded-3xl" />)
              ) : (
                <>
                  {[...accounts].sort((a, b) => (a.type === 'web' ? -1 : 1)).map((acc) => (
                    <div 
                      key={acc.id} 
                      className={`p-5 rounded-3xl border transition-all group relative overflow-hidden flex flex-col justify-center min-h-[110px] ${activeAccountId === acc.id ? 'bg-primary/5 border-primary/30' : 'bg-secondary border-border hover:border-primary/20'}`}
                    >
                      <div className="flex items-start justify-between relative z-10 gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1 cursor-pointer" onClick={() => selectAccount(acc.id)}>
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
                        <div className="absolute -right-2 -bottom-2 opacity-10 text-primary pointer-events-none">
                          <ShieldCheck size={64} />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Action Buttons Integrated into Grid */}
                  <button 
                    onClick={() => loadWebToken()}
                    disabled={isWebLoading}
                    className="p-5 rounded-3xl border border-dashed border-border flex items-center gap-4 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all text-muted-foreground hover:text-blue-500 group h-full min-h-[110px]"
                  >
                    <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform"><Globe size={20} /></div>
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-black uppercase tracking-widest">{t('tokens.web_capture')}</span>
                      <span className="text-[9px] font-bold opacity-60">Open browser to login</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => loadLocalToken()}
                    className="p-5 rounded-3xl border border-dashed border-border flex items-center gap-4 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all text-muted-foreground hover:text-amber-500 group h-full min-h-[110px]"
                  >
                    <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform"><HardDrive size={20} /></div>
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-black uppercase tracking-widest">{t('tokens.local_fetch')}</span>
                      <span className="text-[9px] font-bold opacity-60">Scan Streamlabs Desktop</span>
                    </div>
                  </button>
                </>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card title={t('tokens.account_context')}>
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{t('tokens.username')}</span>
                  {isLoading ? <Skeleton className="h-6 w-32 mt-1" /> : <span className="text-lg font-bold">{status.username === 'Guest' ? t('tokens.guest') : status.username}</span>}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{t('tokens.live_status')}</span>
                  {isLoading ? <Skeleton className="h-6 w-24 mt-1" /> : <span className="text-lg font-bold">{t(status.appStatus)}</span>}
                </div>
                <div className="pt-2">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">{t('tokens.permission')}</span>
                  {isLoading ? (
                    <Skeleton className="h-12 w-full rounded-2xl" />
                  ) : (
                    <div className={`p-4 rounded-2xl border font-black text-[10px] tracking-widest text-center ${canGoLive ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-rose-500/5 border-rose-500/20 text-rose-500'}`}>
                      {canGoLive ? t('tokens.full_rights') : t('tokens.restricted_rights')}
                    </div>
                  )}
                </div>
              </div>

              <div className="divider-x opacity-10" />

              <div className="grid gap-3">
                <Button onClick={() => refreshAccountInfo()} icon={RefreshCw} className="w-full h-12 text-[10px]">
                  {t('tokens.sync')}
                </Button>
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