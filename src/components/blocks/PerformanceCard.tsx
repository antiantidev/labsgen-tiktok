import type { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
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
    <div className="flex items-center gap-4 p-5 border border-border rounded-xl bg-foreground/[0.01]">
      <div className={`p-2.5 rounded-full bg-foreground/5 ${colorClass}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">{label}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 tabular-nums">{valueLabel}</div>
        </div>
        
        {isLoading ? (
          <Skeleton className="h-6 w-full" />
        ) : (
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold tracking-tight tabular-nums">{percentText}</span>
            </div>
            <div className="h-1.5 rounded-full bg-foreground/5 overflow-hidden">
              <motion.div 
                className={`h-full ${barClass} shadow-sm`} 
                initial={{ width: 0 }}
                animate={{ width: percent ? `${Math.max(0, Math.min(100, percent))}%` : "0%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.8 }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
