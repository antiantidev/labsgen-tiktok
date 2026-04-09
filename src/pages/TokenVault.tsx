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
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{t('tokens.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('tokens.desc')}</p>
        </div>
        {isLoading ? (
          <Skeleton className="h-6 w-28" />
        ) : (
          <div className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 ${canGoLive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
            {canGoLive ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
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
            <Button variant="secondary" onClick={() => setCurrentPage('settings')} className="text-xs" icon={ArrowRight}>
              {t('tokens.go_settings')}
            </Button>
          }
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title={t('tokens.saved_accounts')}>
            <div className="space-y-1">
              {isLoading && accounts.length === 0 ? (
                [1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-md" />)
              ) : (
                <>
                  {accounts.length > 0 ? (
                    [...accounts].sort((a, b) => (a.type === 'web' ? -1 : 1)).map((acc) => (
                      <div 
                        key={acc.id} 
                        onClick={() => selectAccount(acc.id)}
                        className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${activeAccountId === acc.id ? 'bg-secondary' : 'hover:bg-secondary/50'}`}
                      >
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${activeAccountId === acc.id ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground'}`}>
                          <User size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">{acc.name}</span>
                            <span className={`text-2xs px-1.5 py-0.5 rounded font-medium ${acc.type === 'local' ? 'bg-warning/10 text-warning' : 'bg-info/10 text-info'}`}>
                              {acc.type || 'web'}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {acc.username ? `@${acc.username.replace('@', '')}` : '---'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {activeAccountId === acc.id && (
                            <div className="p-1 text-success"><CheckCircle2 size={14} /></div>
                          )}
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteAccount(acc.id) }} 
                            className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 flex flex-col items-center text-muted-foreground border border-dashed border-border rounded-md">
                      <User size={24} className="opacity-30" />
                      <span className="text-xs mt-2 opacity-50">{t('tokens.empty_accounts')}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>

          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <PlusCircle size={14} className="text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">{t('tokens.register_new')}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button 
                onClick={() => loadWebToken()}
                disabled={isWebLoading}
                className="flex items-center gap-3 p-4 rounded-md border border-border hover:border-foreground/20 hover:bg-secondary/50 transition-colors text-left"
              >
                <Globe size={18} className="text-info shrink-0" />
                <div>
                  <div className="text-sm font-medium">{t('tokens.web_capture')}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{t('tokens.web_desc')}</div>
                </div>
              </button>

              <button 
                onClick={() => loadLocalToken()}
                className="flex items-center gap-3 p-4 rounded-md border border-border hover:border-foreground/20 hover:bg-secondary/50 transition-colors text-left"
              >
                <HardDrive size={18} className="text-warning shrink-0" />
                <div>
                  <div className="text-sm font-medium">{t('tokens.local_fetch')}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{t('tokens.local_desc')}</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Card title={t('tokens.account_context')}>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-muted-foreground">{t('tokens.username')}</span>
                {isLoading ? <Skeleton className="h-5 w-24 mt-1" /> : <div className="text-sm font-semibold mt-0.5">{status.username === 'Guest' ? t('tokens.guest') : status.username}</div>}
              </div>
              <div>
                <span className="text-xs text-muted-foreground">{t('tokens.live_status')}</span>
                {isLoading ? <Skeleton className="h-5 w-20 mt-1" /> : <div className="text-sm font-medium mt-0.5">{t(status.appStatus)}</div>}
              </div>
              <div>
                <span className="text-xs text-muted-foreground">{t('tokens.permission')}</span>
                {isLoading ? (
                  <Skeleton className="h-8 w-full mt-1" />
                ) : (
                  <div className={`mt-1 p-2 rounded-md text-center text-xs font-medium ${canGoLive ? 'bg-success/5 text-success border border-success/10' : 'bg-destructive/5 text-destructive border border-destructive/10'}`}>
                    {canGoLive ? t('tokens.full_rights') : t('tokens.restricted_rights')}
                  </div>
                )}
              </div>
              <Button onClick={() => refreshAccountInfo()} icon={RefreshCw} className="w-full">
                {t('tokens.sync')}
              </Button>
            </div>
          </Card>

          <Card title={t('tokens.security_tip_title')}>
            <div className="flex gap-3">
              <Key className="text-muted-foreground shrink-0 mt-0.5" size={14} />
              <p className="text-xs text-muted-foreground leading-relaxed">
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
