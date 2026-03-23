import { AlertTriangle, CheckCircle2, Info, XCircle, type LucideIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import type { LogLevel } from "../../shared/domain/app"

type LogBadgeProps = {
  level: LogLevel
}

export const LogBadge = ({ level }: LogBadgeProps) => {
  const { t } = useTranslation()
  const configs: Record<LogLevel, { icon: LucideIcon; color: string }> = {
    info: { icon: Info, color: "text-info bg-info/10 border-info/20" },
    success: { icon: CheckCircle2, color: "text-primary bg-primary/10 border-primary/20" },
    warn: { icon: AlertTriangle, color: "text-warning bg-warning/10 border-warning/20" },
    error: { icon: XCircle, color: "text-destructive bg-destructive/10 border-destructive/20" }
  }
  const config = configs[level]
  const Icon = config.icon

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-tighter ${config.color}`}>
      <Icon size={10} />
      {t(`pulse.filter_${level}`)}
    </div>
  )
}

