import React from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Activity, CheckCircle2, Heart, Cpu, MemoryStick, Users, Sliders, Terminal } from 'lucide-react'
import { Card, Button, Skeleton } from '../components/ui'
import { PerformanceCard, StatCard } from '../components/blocks'
import { useTranslation } from 'react-i18next'
import type { DashboardPageProps } from '../app/types'
import { pageVariants } from '../app/ui/pageMotion'
import { useApiBridge, useDashboardPerformance } from '../hooks'

const Dashboard = ({ status, streamData, onNavigate, isLoading }: DashboardPageProps) => {
  const api = useApiBridge()
  const { t } = useTranslation()
  const { performance, perfLoading, memLabel } = useDashboardPerformance()

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <div>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
        ) : (
          <>
            <h1 className="text-xl font-semibold">{t('dashboard.welcome')} {status.username}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t('dashboard.desc')}</p>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatCard label={t('tokens.live_status')} value={t(status.badge)} icon={ShieldCheck} colorClass={status.canGoLive ? "text-success" : "text-warning"} isLoading={isLoading} />
        <StatCard label={t('dashboard.live_status')} value={streamData.isLive ? t('dashboard.on_air') : t('dashboard.offline')} icon={Activity} colorClass={streamData.isLive ? "text-destructive" : "text-muted-foreground"} isLoading={isLoading} />
        <StatCard label={t('dashboard.system_health')} value={t('dashboard.optimal')} icon={CheckCircle2} colorClass="text-info" isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <PerformanceCard
          label={t('dashboard.cpu_usage')}
          percent={performance.cpuPercent}
          valueLabel={t('dashboard.realtime')}
          icon={Cpu}
          colorClass="text-warning"
          barClass="bg-warning"
          isLoading={isLoading || perfLoading}
        />
        <PerformanceCard
          label={t('dashboard.ram_usage')}
          percent={performance.memPercent}
          valueLabel={memLabel}
          icon={MemoryStick}
          colorClass="text-info"
          barClass="bg-info"
          isLoading={isLoading || perfLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title={t('dashboard.quick_start')}>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'tokens' as const, icon: Users, label: t('tokens.title'), color: 'text-foreground' },
              { id: 'setup' as const, icon: Sliders, label: t('setup.title'), color: 'text-foreground' },
              { id: 'console' as const, icon: Terminal, label: t('console.title'), color: 'text-foreground' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="flex flex-col items-center gap-2 p-4 rounded-md border border-border hover:bg-secondary transition-colors"
              >
                <item.icon size={18} className={item.color} />
                <span className="text-xs font-medium text-center">{item.label}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card title={t('tokens.account_context')}>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-xs text-muted-foreground">{t('tokens.username')}</span>
              {isLoading ? <Skeleton className="h-4 w-20" /> : <span className="text-sm font-medium">{status.username}</span>}
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-xs text-muted-foreground">{t('tokens.permission')}</span>
              {isLoading ? (
                <Skeleton className="h-5 w-16" />
              ) : (
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${status.canGoLive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                  {status.canGoLive ? t('dashboard.authorized') : t('dashboard.restricted_caps')}
                </span>
              )}
            </div>
            <Button
              onClick={() => api.openExternal("https://ko-fi.com/chokernguyen")}
              variant="outline"
              className="w-full mt-2"
              icon={Heart}
            >
              {t('dashboard.support_project')}
            </Button>
          </div>
        </Card>
      </div>
    </motion.div>
  )
}

export default Dashboard
