import type { LucideIcon } from "lucide-react"
import { Card, Skeleton } from "../ui"

type StatCardProps = {
  label: string
  value: string
  icon: LucideIcon
  colorClass?: string
  isLoading?: boolean
}

export const StatCard = ({ label, value, icon: Icon, colorClass = "text-primary", isLoading }: StatCardProps) => (
  <Card className="flex items-center gap-4 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
    <div className={`p-3 rounded-lg bg-secondary/80 light:bg-white/70 ${colorClass} group-hover:scale-110 transition-transform`}>
      <Icon size={20} />
    </div>
    <div className="flex-1">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">{label}</div>
      {isLoading ? <Skeleton className="h-6 w-20 mt-1" /> : <div className="text-lg font-bold">{value}</div>}
    </div>
    <div className={`absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity ${colorClass}`}>
      <Icon size={64} />
    </div>
  </Card>
)

