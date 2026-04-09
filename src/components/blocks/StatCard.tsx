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
  <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-background">
    <div className={`${colorClass}`}>
      <Icon size={16} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-xs text-muted-foreground">{label}</div>
      {isLoading ? <Skeleton className="h-5 w-16 mt-1" /> : <div className="text-sm font-semibold">{value}</div>}
    </div>
  </div>
)
