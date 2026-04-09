import React from 'react'
import { motion } from 'framer-motion'
import { Key, HardDrive, Globe, RefreshCw, User, Trash2, CheckCircle2, ShieldCheck, ShieldAlert, ArrowRight, PlusCircle } from 'lucide-react'
import { Card, Button, Skeleton, AlertBanner } from '../components/ui'
import { useTranslation } from 'react-i18next'
import type { TokenVaultPageProps } from '../app/types'
import { pageVariants } from '../app/ui/pageMotion'

const TokenVault = ({
  loadLocalToken, loadWebToken, isWebLoading, refreshAccountInfo,
  canGoLive, status, accounts = [], selectAccount, deleteAccount, activeAccountId, isLoading,
  isDriverMissing, setCurrentPage
}: TokenVaultPageProps) => {
  const { t } = useTranslation()

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('tokens.title')}</h1>
          <p className="text-sm font-medium text-muted-foreground">{t('tokens.desc')}</p>
        </div>
        {isLoading ? (
          <Skeleton className="h-7 w-32" />
        ) : (
          <div className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${canGoLive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
            {canGoLive ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
            {canGoLive ? t('tokens.verified') : t('tokens.restricted')}
          </div>
        )}
      </div>

      {isDriverMissing && (
        <AlertBanner
          variant="warn"
          title={t('tokens.driver_missing_title')}
          message={t('tokens.driver_missing_desc')}
          actions={
            <Button variant="secondary" onClick={() => setCurrentPage('settings')} className="text-xs font-bold" icon={ArrowRight}>
              {t('tokens.go_settings')}
            </Button>
          }
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <Card title={t('tokens.saved_accounts')}>
            <div className="space-y-3">
              {isLoading && accounts.length === 0 ? (
                [1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)
              ) : (
                <>
                  {accounts.length > 0 ? (
                    [...accounts].sort((a, b) => (a.type === 'web' ? -1 : 1)).map((acc) => (
                      <div
                        key={acc.id}
                        onClick={() => selectAccount(acc.id)}
                        className={`flex items-center gap-4 p-3.5 rounded-lg border transition-all duration-200 border-transparent cursor-pointer ${activeAccountId === acc.id ? 'bg-foreground/[0.05] border-foreground/10 ring-1 ring-foreground/5 shadow-sm' : 'hover:bg-foreground/[0.03] hover:border-border'}`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${activeAccountId === acc.id ? 'bg-foreground text-background' : 'bg-foreground/5 text-muted-foreground/60'}`}>
                          <User size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5">
                            <span className="text-sm font-bold tracking-tight truncate">{acc.name}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tight ${acc.type === 'local' ? 'bg-warning/10 text-warning' : 'bg-info/10 text-info'}`}>
                              {acc.type || 'web'}
                            </span>
                          </div>
                          <span className="text-xs font-medium text-muted-foreground/60 mt-0.5 block">
                            {acc.username ? `@${acc.username.replace('@', '')}` : '---'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {activeAccountId === acc.id && (
                            <div className="text-success"><CheckCircle2 size={16} /></div>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteAccount(acc.id) }}
                            className="p-1.5 rounded-md text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 transition-all"
                            title={t('tokens.delete')}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 flex flex-col items-center text-muted-foreground border border-dashed border-border rounded-xl bg-foreground/[0.01]">
                      <div className="p-4 rounded-full bg-foreground/5 mb-4">
                        <User size={32} className="opacity-20" />
                      </div>
                      <span className="text-sm font-semibold opacity-40">{t('tokens.empty_accounts')}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center gap-2.5 px-1.5">
              <PlusCircle size={15} className="text-muted-foreground/60" />
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">{t('tokens.register_new')}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => loadWebToken()}
                disabled={isWebLoading}
                className="group flex flex-col gap-4 p-6 rounded-xl border border-border bg-foreground/[0.01] hover:bg-foreground/[0.04] hover:border-foreground/20 transition-all duration-200 text-left relative overflow-hidden"
              >
                <div className="p-3 rounded-full bg-info/10 text-info w-fit group-hover:scale-110 transition-transform">
                  <Globe size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold tracking-tight">{t('tokens.web_capture')}</div>
                  <div className="text-xs font-medium text-muted-foreground/60 mt-1 leading-relaxed">{t('tokens.web_desc')}</div>
                </div>
              </button>

              <button
                onClick={() => loadLocalToken()}
                className="group flex flex-col gap-4 p-6 rounded-xl border border-border bg-foreground/[0.01] hover:bg-foreground/[0.04] hover:border-foreground/20 transition-all duration-200 text-left relative overflow-hidden"
              >
                <div className="p-3 rounded-full bg-warning/10 text-warning w-fit group-hover:scale-110 transition-transform">
                  <HardDrive size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold tracking-tight">{t('tokens.local_fetch')}</div>
                  <div className="text-xs font-medium text-muted-foreground/60 mt-1 leading-relaxed">{t('tokens.local_desc')}</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card title={t('tokens.account_context')}>
            <div className="space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{t('tokens.username')}</span>
                {isLoading ? <Skeleton className="h-5 w-24 mt-1" /> : <div className="text-sm font-bold tracking-tight truncate">{status.username === 'Guest' ? t('tokens.guest') : status.username}</div>}
              </div>
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{t('tokens.account_status')}</span>
                {isLoading ? <Skeleton className="h-5 w-20 mt-1" /> : <div className="text-sm font-semibold tracking-tight">{t(status.appStatus)}</div>}
              </div>
              <div className="pt-2">
                {isLoading ? (
                  <Skeleton className="h-7 w-full" />
                ) : (
                  <div className={`p-2.5 rounded-md text-center text-[10px] font-bold uppercase tracking-widest border ${canGoLive ? 'bg-success/5 text-success border-success/10' : 'bg-destructive/5 text-destructive border-destructive/10'}`}>
                    {canGoLive ? t('tokens.full_rights') : t('tokens.restricted_rights')}
                  </div>
                )}
              </div>
              <Button onClick={() => refreshAccountInfo()} icon={RefreshCw} className="w-full h-11 font-bold shadow-lg shadow-foreground/5" disabled={isLoading}>
                {t('tokens.sync')}
              </Button>
            </div>
          </Card>

          <div className="p-5 rounded-xl border border-border bg-foreground/[0.01] flex gap-4">
            <div className="p-2.5 rounded-lg bg-foreground/5 h-fit text-muted-foreground/60">
              <Key size={18} />
            </div>
            <p className="text-xs font-medium text-muted-foreground/60 leading-relaxed">
              {t('tokens.security_tip')}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default TokenVault
