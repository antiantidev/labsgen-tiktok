import { AlertTriangle, CheckCircle2, Info, XCircle, type LucideIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import type { LogLevel } from "../../shared/domain/app"

type LogBadgeProps = {
  level: LogLevel
}

export const LogBadge = ({ level }: LogBadgeProps) => {
  const { t } = useTranslation()
  const configs: Record<LogLevel, { icon: LucideIcon; color: string }> = {
    info: { icon: Info, color: "text-blue-500 bg-blue-500/10 border-blue-500/10" },
    success: { icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/10" },
    warn: { icon: AlertTriangle, color: "text-amber-500 bg-amber-500/10 border-amber-500/10" },
    error: { icon: XCircle, color: "text-rose-500 bg-rose-500/10 border-rose-500/10" }
  }
  const config = configs[level]
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${config.color}`}>
      <Icon size={10} strokeWidth={3} />
      {t(`pulse.filter_${level}`)}
    </span>
  )
}
