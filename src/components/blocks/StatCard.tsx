import type { LucideIcon } from "lucide-react"
import { Skeleton } from "../ui"

type StatCardProps = {
  label: string
  value: string
  icon: LucideIcon
  colorClass?: string
  isLoading?: boolean
}

export const StatCard = ({ label, value, icon: Icon, colorClass = "text-foreground", isLoading }: StatCardProps) => (
  <div className="flex items-center gap-4 p-5 border border-border rounded-xl bg-foreground/[0.01]">
    <div className={`p-2.5 rounded-full bg-foreground/5 ${colorClass}`}>
      <Icon size={18} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">{label}</div>
      {isLoading ? (
        <Skeleton className="h-6 w-20 mt-1" />
      ) : (
        <div className={`text-base font-bold tracking-tight truncate mt-0.5 ${colorClass}`}>
          {value}
        </div>
      )}
    </div>
  </div>
)
