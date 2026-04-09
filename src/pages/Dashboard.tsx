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
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
      <div className="flex flex-col gap-1.5">
        {isLoading ? (
          <div className="space-y-2.5">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-80" />
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('dashboard.welcome')} {status.username}</h1>
            <p className="text-sm font-medium text-muted-foreground">{t('dashboard.desc')}</p>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label={t('dashboard.status_title')} value={t(status.badge)} icon={ShieldCheck} colorClass={status.canGoLive ? "text-success" : "text-warning"} isLoading={isLoading} />
        <StatCard label={t('dashboard.live_status')} value={streamData.isLive ? t('dashboard.on_air') : t('dashboard.offline')} icon={Activity} colorClass={streamData.isLive ? "text-destructive" : "text-muted-foreground"} isLoading={isLoading} />
        <StatCard label={t('dashboard.system_health')} value={t('dashboard.optimal')} icon={CheckCircle2} colorClass="text-info" isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('dashboard.quick_start')}>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'tokens' as const, icon: Users, label: t('tokens.title') },
              { id: 'setup' as const, icon: Sliders, label: t('setup.title') },
              { id: 'console' as const, icon: Terminal, label: t('console.title') }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="group flex flex-col items-center gap-3 p-5 rounded-lg border border-border bg-foreground/[0.02] hover:bg-foreground/[0.05] hover:border-foreground/20 transition-all duration-200"
              >
                <div className="p-3 rounded-full bg-foreground text-background group-hover:scale-110 transition-transform duration-200">
                  <item.icon size={20} />
                </div>
                <span className="text-xs font-bold tracking-tight text-center">{item.label}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card title={t('tokens.account_context')}>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-border/50">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('tokens.username')}</span>
              {isLoading ? <Skeleton className="h-5 w-24" /> : <span className="text-sm font-bold tracking-tight">{status.username}</span>}
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-border/50">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('tokens.permission')}</span>
              {isLoading ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight ${status.canGoLive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                  {status.canGoLive ? t('dashboard.authorized') : t('dashboard.restricted_caps')}
                </div>
              )}
            </div>
            <Button
              onClick={() => api.openExternal("https://ko-fi.com/chokernguyen")}
              variant="outline"
              className="w-full mt-4 h-11"
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
