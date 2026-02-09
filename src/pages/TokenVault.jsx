import React from 'react'
import { motion } from 'framer-motion'
import { Key, HardDrive, Globe, RefreshCw, User, Trash2, CheckCircle2, ShieldCheck, ShieldAlert, ArrowRight, PlusCircle } from 'lucide-react'
import { Card, Button, Skeleton, AlertBanner } from '../components/ui'
import { useTranslation } from 'react-i18next'

const pageVariants = {
  initial: { opacity: 0, y: 10, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -10, filter: 'blur(10px)', transition: { duration: 0.2 } }
}

const TokenVault = ({ 
  loadLocalToken, loadWebToken, isWebLoading, refreshAccountInfo,
  canGoLive, status, accounts = [], selectAccount, deleteAccount, activeAccountId, isLoading,
  isDriverMissing, setCurrentPage
}) => {
  const { t } = useTranslation()

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">{t('tokens.title')}</h1>
          <p className="text-muted-foreground font-medium text-sm">{t('tokens.desc')}</p>
        </div>
        {isLoading ? (
          <Skeleton className="h-8 w-40 rounded-full" />
        ) : (
          <div className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-3 border ${canGoLive ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}>
            {canGoLive ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
            {canGoLive ? t('tokens.verified') : t('tokens.restricted')}
          </div>
        )}
      </div>

      {isDriverMissing && (
        <AlertBanner 
          variant="warn"
          title="ChromeDriver Missing"
          message="The web capture engine is currently disabled. Please go to System Settings to download and install the required binary components."
          actions={
            <Button variant="secondary" onClick={() => setCurrentPage('settings')} className="h-10 px-5 rounded-xl text-xs" icon={ArrowRight}>
              Go to Settings
            </Button>
          }
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
          <Card title={t('tokens.saved_accounts')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading && accounts.length === 0 ? (
                [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[110px] w-full rounded-xl" />)
              ) : (
                <>
                  {accounts.length > 0 ? (
                    [...accounts].sort((a, b) => (a.type === 'web' ? -1 : 1)).map((acc) => (
                      <div 
                        key={acc.id} 
                        className={`p-5 rounded-xl border transition-all group relative overflow-hidden flex flex-col justify-center min-h-[110px] ${activeAccountId === acc.id ? 'bg-primary/5 border-primary/30' : 'bg-secondary border-border hover:border-primary/20'}`}
                      >
                        <div className="flex items-start justify-between relative z-10 gap-3">
                          <div className="flex items-start gap-3 min-w-0 flex-1 cursor-pointer" onClick={() => selectAccount(acc.id)}>
                            <div className={`p-2.5 rounded-lg relative shrink-0 mt-0.5 ${activeAccountId === acc.id ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground'}`}>
                              <User size={18} />
                              <div className="absolute -top-1 -right-1">
                                {acc.type === 'local' ? (
                                  <div className="bg-warning rounded-full p-0.5 border border-background shadow-lg" title={t('tokens.local_fetch')}>
                                    <HardDrive size={6} className="text-white" />
                                  </div>
                                ) : (
                                  <div className="bg-info rounded-full p-0.5 border border-background shadow-lg" title={t('tokens.web_capture')}>
                                    <Globe size={6} className="text-white" />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="font-bold text-[14px] leading-tight break-words pr-1 text-foreground">
                                {acc.name}
                              </span>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${acc.type === 'local' ? 'bg-warning/10 text-warning border border-warning/20' : 'bg-info/10 text-info border border-info/20'}`}>
                                  {acc.type || 'web'}
                                </span>
                                <span className="text-[12px] text-primary font-bold break-all italic opacity-80">
                                  {acc.username ? `@${acc.username.replace('@', '')}` : '---'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 bg-background/50 p-1 rounded-lg border border-border/50">
                            {activeAccountId !== acc.id ? (
                              <button onClick={() => selectAccount(acc.id)} className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"><CheckCircle2 size={14} /></button>
                            ) : (
                              <div className="p-2 rounded-lg text-primary bg-primary/10"><ShieldCheck size={14} /></div>
                            )}
                            <button onClick={() => deleteAccount(acc.id)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"><Trash2 size={14} /></button>
                          </div>
                        </div>
                        {activeAccountId === acc.id && <div className="absolute -right-2 -bottom-2 opacity-10 text-primary pointer-events-none"><ShieldCheck size={64} /></div>}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-10 flex flex-col items-center justify-center text-muted-foreground opacity-20 border-2 border-dashed border-border rounded-xl">
                      <User size={48} />
                      <span className="text-[11px] font-black uppercase tracking-[0.3em] mt-4">No identities stored</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>

          <div className="space-y-5">
            <div className="flex items-center gap-3 px-2">
              <PlusCircle size={16} className="text-primary" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Register New Identity</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button 
                onClick={() => loadWebToken()}
                disabled={isWebLoading}
                className="p-6 rounded-xl bg-secondary/30 border border-border hover:border-info/40 hover:bg-info/5 transition-all flex items-center gap-5 group text-foreground text-left"
              >
                <div className="p-4 rounded-lg bg-info/10 text-info group-hover:scale-110 transition-transform"><Globe size={24} /></div>
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[13px] font-bold uppercase tracking-wide">{t('tokens.web_capture')}</span>
                  <span className="text-[12px] font-medium text-muted-foreground leading-snug">{t('tokens.web_desc')}</span>
                </div>
              </button>

              <button 
                onClick={() => loadLocalToken()}
                className="p-6 rounded-xl bg-secondary/30 border border-border hover:border-warning/40 hover:bg-warning/5 transition-all flex items-center gap-5 group text-foreground text-left"
              >
                <div className="p-4 rounded-lg bg-warning/10 text-warning group-hover:scale-110 transition-transform"><HardDrive size={24} /></div>
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[13px] font-bold uppercase tracking-wide">{t('tokens.local_fetch')}</span>
                  <span className="text-[12px] font-medium text-muted-foreground leading-snug">{t('tokens.local_desc')}</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <Card title={t('tokens.account_context')}>
            <div className="space-y-6">
              <div className="space-y-5">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('tokens.username')}</span>
                  {isLoading ? <Skeleton className="h-6 w-32 mt-1" /> : <span className="text-lg font-black tracking-tight">{status.username === 'Guest' ? t('tokens.guest') : status.username}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('tokens.live_status')}</span>
                  {isLoading ? <Skeleton className="h-6 w-24 mt-1" /> : <span className="text-lg font-bold">{t(status.appStatus)}</span>}
                </div>
                <div className="pt-2">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 block">{t('tokens.permission')}</span>
                  {isLoading ? (
                    <Skeleton className="h-12 w-full rounded-xl" />
                  ) : (
                    <div className={`p-4 rounded-xl border font-black text-[11px] tracking-[0.15em] text-center ${canGoLive ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-destructive/5 border-destructive/20 text-destructive'}`}>
                      {canGoLive ? t('tokens.full_rights') : t('tokens.restricted_rights')}
                    </div>
                  )}
                </div>
              </div>
              <div className="divider-x opacity-10" />
              <div className="grid gap-3">
                <Button onClick={() => refreshAccountInfo()} icon={RefreshCw} className="w-full py-4 text-xs">{t('tokens.sync')}</Button>
              </div>
            </div>
          </Card>

          <Card title={t('tokens.security_tip_title')}>
            <div className="flex gap-4">
              <Key className="text-primary shrink-0" size={20} />
              <p className="text-[12px] font-medium text-muted-foreground leading-relaxed">
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
