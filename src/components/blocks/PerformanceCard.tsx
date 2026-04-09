import type { LucideIcon } from "lucide-react"
import { Skeleton } from "../ui"

type PerformanceCardProps = {
  label: string
  percent: number | null
  valueLabel: string
  icon: LucideIcon
  colorClass?: string
  barClass?: string
  isLoading?: boolean
}

export const PerformanceCard = ({
  label,
  percent,
  valueLabel,
  icon: Icon,
  colorClass = "text-foreground",
  barClass = "bg-foreground",
  isLoading
}: PerformanceCardProps) => {
  const percentText = percent === null || percent === undefined || Number.isNaN(percent) ? "--" : `${percent.toFixed(1)}%`

  return (
    <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-background">
      <div className={`${colorClass}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 space-y-2">
        <div className="text-xs text-muted-foreground">{label}</div>
        {isLoading ? (
          <Skeleton className="h-5 w-20" />
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold">{percentText}</span>
            <span className="text-xs text-muted-foreground">{valueLabel}</span>
          </div>
        )}
        <div className="h-1 rounded-full bg-secondary overflow-hidden">
          <div className={`h-full ${barClass} opacity-80 transition-all`} style={{ width: percent ? `${Math.max(0, Math.min(100, percent))}%` : "0%" }} />
        </div>
      </div>
    </div>
  )
}
