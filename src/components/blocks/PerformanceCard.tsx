import type { LucideIcon } from "lucide-react"
import { Card, Skeleton } from "../ui"

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
  colorClass = "text-primary",
  barClass = "bg-primary",
  isLoading
}: PerformanceCardProps) => {
  const percentText = percent === null || percent === undefined || Number.isNaN(percent) ? "--" : `${percent.toFixed(1)}%`

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
          <div className={`h-full ${barClass} opacity-80`} style={{ width: percent ? `${Math.max(0, Math.min(100, percent))}%` : "0%" }} />
        </div>
      </div>
      <div className={`absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity ${colorClass}`}>
        <Icon size={64} />
      </div>
    </Card>
  )
}

