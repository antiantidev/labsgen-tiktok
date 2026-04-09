import type { InputHTMLAttributes, ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, X, Info, AlertTriangle, XCircle, AlertCircle, type LucideIcon } from "lucide-react"

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger"

type ButtonProps = {
  children?: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: ButtonVariant
  className?: string
  icon?: LucideIcon
  loading?: boolean
  title?: string
}

export const Button = ({ children, onClick, disabled, variant = "primary", className = "", icon: Icon, loading, title }: ButtonProps) => {
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-foreground text-background hover:bg-foreground/90 active:bg-foreground/80 shadow-[0_1px_2px_rgba(0,0,0,0.1)]",
    secondary: "bg-secondary text-secondary-foreground border border-border hover:bg-accent active:bg-accent/80",
    outline: "bg-transparent border border-border text-foreground hover:bg-secondary active:bg-secondary/80",
    ghost: "bg-transparent text-muted-foreground hover:text-foreground hover:bg-secondary active:bg-secondary/80",
    danger: "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-destructive-foreground active:opacity-90"
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-md font-medium text-sm transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none select-none ${variants[variant]} ${className}`}
    >
      {loading ? (
        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {Icon && <Icon size={14} className="shrink-0" />}
          {children}
        </>
      )}
    </button>
  )
}

type CardProps = {
  children?: ReactNode
  title?: string
  className?: string
  onClick?: () => void
}

export const Card = ({ children, title, className = "", onClick }: CardProps) => (
  <div
    onClick={onClick}
    className={`bg-background border border-border rounded-lg p-5 transition-all duration-300 ${onClick ? "cursor-pointer hover:border-foreground/20 hover:bg-secondary/20" : ""} ${className}`}
  >
    {title && (
      <h3 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-widest mb-4 select-none">
        {title}
      </h3>
    )}
    {children}
  </div>
)

type AlertBannerProps = {
  title: string
  message: string
  variant?: "warn" | "error" | "info"
  actions?: ReactNode
}

export const AlertBanner = ({ title, message, variant = "warn", actions }: AlertBannerProps) => {
  const styles: Record<NonNullable<AlertBannerProps["variant"]>, string> = {
    warn: "bg-warning/5 border-warning/20 text-warning",
    error: "bg-destructive/5 border-destructive/20 text-destructive",
    info: "bg-info/5 border-info/20 text-info"
  }
  return (
    <div className={`p-4 rounded-md border flex items-start gap-3.5 ${styles[variant]}`}>
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm leading-none">{title}</h4>
        <p className="text-xs mt-1.5 opacity-80 leading-relaxed font-medium">{message}</p>
        {actions && <div className="mt-4 flex gap-2">{actions}</div>}
      </div>
    </div>
  )
}

type InputProps = {
  label?: string
  icon?: LucideIcon
  className?: string
} & InputHTMLAttributes<HTMLInputElement>

export const Input = ({ label, icon: Icon, className = "", ...props }: InputProps) => (
  <div className="space-y-1.5 w-full">
    {label && (
      <label className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-widest ml-0.5">
        {label}
      </label>
    )}
    <div className="relative group">
      <input
        {...props}
        className={`w-full bg-background border border-border rounded-md px-3 py-2 text-sm transition-all duration-200 outline-none focus:ring-4 focus:ring-foreground/5 focus:border-foreground/20 hover:border-foreground/20 placeholder:text-muted-foreground/60 ${className}`}
      />
      {Icon && <Icon size={14} className="absolute right-3 top-2.5 text-muted-foreground/40 group-focus-within:text-foreground/60 transition-colors" />}
    </div>
  </div>
)

type CheckboxProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
}

export const Checkbox = ({ checked, onChange, label, description }: CheckboxProps) => (
  <label className="flex items-start gap-3.5 cursor-pointer group select-none">
    <div className="relative flex items-center justify-center mt-0.5">
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div
        className={`w-4 h-4 border rounded shadow-sm transition-all duration-200 flex items-center justify-center ${
          checked ? "bg-foreground border-foreground" : "bg-background border-border group-hover:border-foreground/30"
        }`}
      >
        {checked && <Check size={10} className="text-background" strokeWidth={3} />}
      </div>
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-semibold tracking-tight">{label}</span>
      {description && <span className="text-xs text-muted-foreground/70 mt-0.5 leading-relaxed font-medium">{description}</span>}
    </div>
  </label>
)

type SwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
  icon?: LucideIcon
}

export const Switch = ({ checked, onChange, label, description, icon: Icon }: SwitchProps) => (
  <label className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-background hover:bg-secondary/40 transition-all duration-200 cursor-pointer group">
    <div className="flex items-center gap-3.5 pr-3">
      {Icon && (
        <Icon size={16} className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
      )}
      <div className="flex flex-col">
        <span className="text-sm font-semibold tracking-tight">{label}</span>
        {description && <span className="text-xs text-muted-foreground/60 mt-0.5 leading-relaxed font-medium">{description}</span>}
      </div>
    </div>
    <div className="relative inline-flex items-center shrink-0">
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${checked ? "bg-foreground" : "bg-muted shadow-inner"}`}>
        <div
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-background shadow-sm transition-transform duration-200 ${checked ? "translate-x-4" : "translate-x-0"}`}
        />
      </div>
    </div>
  </label>
)

export const Skeleton = ({ className = "" }: { className?: string }) => <div className={`skeleton ${className}`} />

type LoadingOverlayProps = {
  message?: string
  progress?: number
}

export const LoadingOverlay = ({ message, progress }: LoadingOverlayProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, transition: { duration: 0.3 } }}
    className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-background rounded-xl overflow-hidden"
  >
    <div className="flex flex-col items-center gap-10">
      <div className="relative">
        <div className="w-12 h-12 border-2 border-foreground/5 border-t-foreground rounded-full animate-spin" />
      </div>
      <div className="w-60 space-y-4 text-center">
        <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-foreground" 
            initial={{ width: 0 }}
            animate={{ width: `${progress || 0}%` }}
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold text-muted-foreground tracking-widest uppercase">{message}</p>
          <span className="text-xs font-mono text-foreground/40 tabular-nums">{Math.round(progress || 0)}%</span>
        </div>
      </div>
    </div>
  </motion.div>
)

type ToastProps = {
  message: string
  type?: "success" | "error" | "warn" | "info"
  onClose: () => void
}

export const Toast = ({ message, type = "info", onClose }: ToastProps) => {
  const icons: Record<NonNullable<ToastProps["type"]>, ReactNode> = {
    success: <Check size={14} className="text-success" />,
    error: <XCircle size={14} className="text-destructive" />,
    warn: <AlertTriangle size={14} className="text-warning" />,
    info: <Info size={14} className="text-info" />
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className="flex items-center gap-3.5 px-4 py-3 rounded-lg bg-background border border-border shadow-2xl min-w-[320px] max-w-sm pointer-events-auto mx-auto"
    >
      <div className="shrink-0">{icons[type]}</div>
      <p className="flex-1 text-sm font-semibold tracking-tight text-foreground">{message}</p>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className="p-1 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-all shrink-0"
        aria-label="Close"
      >
        <X size={14} />
      </button>
    </motion.div>
  )
}

export const ToastContainer = ({ children }: { children?: ReactNode }) => (
  <div className="fixed bottom-8 left-0 right-0 z-[500] flex flex-col gap-3 pointer-events-none items-center w-full">
    <AnimatePresence mode="popLayout">{children}</AnimatePresence>
  </div>
)
