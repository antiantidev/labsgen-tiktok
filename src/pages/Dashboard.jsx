import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Activity, CheckCircle2, Heart, Cpu, MemoryStick, Users, Sliders, Terminal } from 'lucide-react'
import { Card, Button, Skeleton } from '../components/ui'
import { useTranslation } from 'react-i18next'

const pageVariants = {
  initial: { opacity: 0, y: 10, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -10, filter: 'blur(10px)', transition: { duration: 0.2 } }
}

const StatCard = ({ label, value, icon: Icon, colorClass = "text-primary", isLoading }) => (
  <Card className="flex items-center gap-4 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
    <div className={`p-3 rounded-lg bg-secondary/80 light:bg-white/70 ${colorClass} group-hover:scale-110 transition-transform`}>
      <Icon size={20} />
    </div>
    <div className="flex-1">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">{label}</div>
      {isLoading ? (
        <Skeleton className="h-6 w-20 mt-1" />
      ) : (
        <div className="text-lg font-bold">{value}</div>
      )}
    </div>
    <div className={`absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity ${colorClass}`}>
      <Icon size={64} />
    </div>
  </Card>
)

const PerformanceCard = ({ label, percent, valueLabel, icon: Icon, colorClass = "text-primary", barClass = "bg-primary", isLoading }) => {
  const percentText = useMemo(() => {
    if (percent === null || percent === undefined || Number.isNaN(percent)) return "--";
    return `${percent.toFixed(1)}%`;
  }, [percent]);

  return (
    <Card className="flex items-center gap-4 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-lg bg-secondary/80 light:bg-white/70 ${colorClass} group-hover:scale-110 transition-transform`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 space-y-2">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">{label}</div>
        {isLoading ? (
          <Skeleton className="h-6 w-24" />
        ) : (
          <div className="flex items-baseline gap-2">
            <div className="text-lg font-bold">{percentText}</div>
            <div className="text-[11px] text-muted-foreground font-semibold">{valueLabel}</div>
          </div>
        )}
        <div className="h-2 rounded-full bg-secondary/60 light:bg-black/5 overflow-hidden">
          <div
            className={`h-full ${barClass} opacity-80`}
            style={{ width: percent ? `${Math.max(0, Math.min(100, percent))}%` : "0%" }}
          />
        </div>
      </div>
      <div className={`absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity ${colorClass}`}>
        <Icon size={64} />
      </div>
    </Card>
  );
};

const Dashboard = ({ status, streamData, onNavigate, isLoading }) => {
  const { t } = useTranslation()
  const [performance, setPerformance] = useState({
    cpuPercent: null,
    memPercent: null,
    memUsedMB: 0,
    memTotalMB: 0
  })
  const [perfLoading, setPerfLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    let intervalId = null

    const fetchPerformance = async () => {
      try {
        const res = await window.api.getPerformance()
        if (!isMounted || !res || !res.ok) return
        setPerformance({
          cpuPercent: res.cpuPercent,
          memPercent: res.memPercent,
          memUsedMB: res.memUsedMB,
          memTotalMB: res.memTotalMB
        })
        setPerfLoading(false)
      } catch (err) {}
    }

    fetchPerformance()
    intervalId = setInterval(fetchPerformance, 2000)

    return () => {
      isMounted = false
      if (intervalId) clearInterval(intervalId)
    }
  }, [])

  const memLabel = useMemo(() => {
    if (!performance.memTotalMB) return "--"
    const used = performance.memUsedMB.toFixed(0)
    const total = performance.memTotalMB.toFixed(0)
    return `${used} / ${total} MB`
  }, [performance.memUsedMB, performance.memTotalMB])

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
      <div className="flex flex-col gap-2">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-96" />
          </div>
        ) : (
          <>
            <h1 className="text-4xl font-black tracking-tight">{t('dashboard.welcome')} <span className="text-primary">{status.username}</span></h1>
            <p className="text-muted-foreground text-lg font-medium">{t('dashboard.desc')}</p>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label={t('tokens.live_status')} value={t(status.badge)} icon={ShieldCheck} colorClass={status.canGoLive ? "text-primary" : "text-warning"} isLoading={isLoading} />
        <StatCard label={t('dashboard.live_status')} value={streamData.isLive ? t('dashboard.on_air') : t('dashboard.offline')} icon={Activity} colorClass={streamData.isLive ? "text-destructive" : "text-muted-foreground"} isLoading={isLoading} />
        <StatCard label={t('dashboard.system_health')} value={t('dashboard.optimal')} icon={CheckCircle2} colorClass="text-info" isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title={t('dashboard.quick_start')}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button onClick={() => onNavigate('tokens')} className="flex flex-col items-center justify-center gap-4 p-8 rounded-xl bg-secondary border border-border light:bg-white/70 light:border-black/5 hover:border-primary/20 hover:bg-primary/5 transition-all group text-foreground">
              <div className="p-4 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform"><Users size={32} /></div>
              <span className="text-sm font-bold uppercase tracking-widest">{t('tokens.title')}</span>
            </button>
            <button onClick={() => onNavigate('setup')} className="flex flex-col items-center justify-center gap-4 p-8 rounded-xl bg-secondary border border-border light:bg-white/70 light:border-black/5 hover:border-info/20 hover:bg-info/5 transition-all group text-foreground">
              <div className="p-4 rounded-lg bg-info/10 text-info group-hover:scale-110 transition-transform"><Sliders size={32} /></div>
              <span className="text-sm font-bold uppercase tracking-widest text-center">{t('setup.title')}</span>
            </button>
            <button onClick={() => onNavigate('console')} className="flex flex-col items-center justify-center gap-4 p-8 rounded-xl bg-secondary border border-border light:bg-white/70 light:border-black/5 hover:border-primary/20 hover:bg-primary/5 transition-all group text-foreground">
              <div className="p-4 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform"><Terminal size={32} /></div>
              <span className="text-sm font-bold uppercase tracking-widest">{t('console.title')}</span>
            </button>
          </div>
        </Card>

        <Card title={t('tokens.account_context')}>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary border border-border light:bg-white/70 light:border-black/5">
              <span className="text-[11px] text-muted-foreground font-black uppercase tracking-widest">{t('tokens.username')}</span>
              {isLoading ? <Skeleton className="h-4 w-24" /> : <span className="font-bold">{status.username}</span>}
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary border border-border light:bg-white/70 light:border-black/5">
              <span className="text-[11px] text-muted-foreground font-black uppercase tracking-widest">{t('tokens.permission')}</span>
              {isLoading ? (
                <Skeleton className="h-6 w-20 rounded-full" />
              ) : (
                <span className={`text-[10px] px-3 py-1 rounded-full font-black ${status.canGoLive ? 'bg-primary text-primary-foreground' : 'bg-destructive/20 text-destructive'}`}>
                  {status.canGoLive ? t('dashboard.authorized') : t('dashboard.restricted_caps')}
                </span>
              )}
            </div>
            <Button onClick={() => window.api.openExternal("https://ko-fi.com/chokernguyen")} className="w-full py-4 bg-gradient-to-r from-primary to-success rounded-xl" icon={Heart}>
              {t('dashboard.support_project')}
            </Button>
          </div>
        </Card>
      </div>
    </motion.div>
  )
}

export default Dashboard
