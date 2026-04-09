import { AlertTriangle, CheckCircle2, Info, XCircle, type LucideIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import type { LogLevel } from "../../shared/domain/app"

type LogBadgeProps = {
  level: LogLevel
}

export const LogBadge = ({ level }: LogBadgeProps) => {
  const { t } = useTranslation()
  const configs: Record<LogLevel, { icon: LucideIcon; color: string }> = {
    info: { icon: Info, color: "text-info bg-info/10" },
    success: { icon: CheckCircle2, color: "text-success bg-success/10" },
    warn: { icon: AlertTriangle, color: "text-warning bg-warning/10" },
    error: { icon: XCircle, color: "text-destructive bg-destructive/10" }
  }
  const config = configs[level]
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-2xs font-medium ${config.color}`}>
      <Icon size={10} />
      {t(`pulse.filter_${level}`)}
    </span>
  )
}
