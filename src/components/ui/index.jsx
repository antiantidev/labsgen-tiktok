import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Info, AlertTriangle, XCircle, ChevronRight, AlertCircle } from 'lucide-react'

export const Button = ({ children, onClick, disabled, variant = 'primary', className = '', icon: Icon, loading }) => {
  const variants = {
    primary: 'bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary))_55%,rgba(255,255,255,0.08))] text-primary-foreground shadow-[0_12px_32px_rgba(34,197,94,0.25)] hover:shadow-[0_18px_40px_rgba(34,197,94,0.35)] ring-1 ring-primary/30',
    secondary: 'bg-secondary/70 text-secondary-foreground border border-white/5 light:border-black/5 hover:bg-secondary transition-colors',
    outline: 'bg-transparent border border-border hover:border-primary/50 hover:text-primary',
    ghost: 'bg-transparent hover:bg-secondary/70 text-muted-foreground hover:text-foreground',
    danger: 'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-destructive-foreground',
  }

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02, y: -1 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[12px] uppercase tracking-[0.2em] transition-all disabled:opacity-30 disabled:shadow-none ${variants[variant]} ${className}`}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {Icon && <Icon size={16} className="shrink-0" />}
          {children}
        </>
      )}
    </motion.button>
  )
}

export const Card = ({ children, title, className = "", onClick }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={onClick}
    className={`glass border rounded-2xl p-6 transition-all group relative overflow-hidden ${onClick ? 'cursor-pointer hover:border-primary/30' : ''} ${className}`}
  >
    {title && <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/80 mb-5 group-hover:text-primary transition-colors">{title}</h3>}
    {children}
  </motion.div>
)

export const AlertBanner = ({ title, message, variant = 'warn', actions }) => {
  const styles = {
    warn: 'bg-warning/10 border-warning/30 text-warning',
    error: 'bg-destructive/10 border-destructive/30 text-destructive',
    info: 'bg-info/10 border-info/30 text-info'
  }
  return (
    <div className={`p-6 rounded-2xl border flex items-start gap-5 ${styles[variant]}`}>
      <div className="p-3 rounded-xl bg-background/50 border border-current/10 shrink-0">
        <AlertCircle size={24} />
      </div>
      <div className="flex-1 space-y-1">
        <h4 className="font-black text-[13px] uppercase tracking-wider leading-none">{title}</h4>
        <p className="text-[12px] font-medium opacity-90 leading-relaxed">{message}</p>
        {actions && <div className="pt-3 flex gap-3">{actions}</div>}
      </div>
    </div>
  )
}

export const Input = ({ label, icon: Icon, className = "", ...props }) => (
  <div className="group space-y-2 w-full">
    {label && <label className="text-[10px] uppercase font-bold text-muted-foreground/80 ml-1 group-focus-within:text-primary transition-colors tracking-[0.2em]">{label}</label>}
    <div className="relative">
      <input 
        {...props}
        className={`w-full bg-secondary/60 border border-border rounded-xl px-5 py-3.5 focus:ring-2 ring-primary/25 focus:border-primary/40 outline-none transition-all hover:bg-muted/80 focus:bg-background text-sm font-medium placeholder:text-muted-foreground/60 ${className}`}
      />
      {Icon && <Icon size={18} className="absolute right-5 top-3.5 text-muted-foreground/80 group-focus-within:text-primary transition-colors" />}
    </div>
  </div>
)

export const Checkbox = ({ checked, onChange, label, description }) => (
  <label className="flex items-start gap-4 cursor-pointer group select-none">
    <div className="relative flex items-center justify-center mt-1">
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <motion.div 
        animate={checked ? { backgroundColor: 'hsl(var(--primary))', borderColor: 'hsl(var(--primary))' } : { backgroundColor: 'transparent', borderColor: 'hsl(var(--border))' }}
        className="w-6 h-6 border-2 rounded-md flex items-center justify-center transition-colors"
      >
        <AnimatePresence>
          {checked && (
            <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: -45 }} transition={{ duration: 0.2 }}>
              <Check size={16} className="text-primary-foreground stroke-[4px]" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
    <div className="flex flex-col gap-0.5">
      <span className={`text-[14px] font-bold transition-colors ${checked ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>{label}</span>
      {description && <span className="text-[12px] text-muted-foreground font-medium leading-relaxed">{description}</span>}
    </div>
  </label>
)

export const Switch = ({ checked, onChange, label, description }) => (
  <label className="flex items-center justify-between p-5 rounded-2xl bg-secondary/50 border border-border hover:border-primary/30 transition-all cursor-pointer group">
    <div className="flex flex-col gap-0.5 pr-4">
      <span className="text-[14px] font-bold group-hover:text-primary transition-colors">{label}</span>
      {description && <span className="text-[12px] text-muted-foreground font-medium leading-relaxed">{description}</span>}
    </div>
    <div className="relative inline-flex items-center shrink-0">
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <motion.div 
        animate={checked ? { backgroundColor: 'hsl(var(--primary))' } : { backgroundColor: 'hsl(var(--muted))' }}
        className="w-11 h-6 rounded-full transition-colors relative"
      >
        <motion.div 
          animate={checked ? { x: 22 } : { x: 2 }}
          className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </motion.div>
    </div>
  </label>
)

export const Skeleton = ({ className = "" }) => (
  <div className={`skeleton ${className} rounded-lg`} />
)

export const LoadingOverlay = ({ message, progress }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.05, filter: 'blur(20px)', transition: { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] } }}
    className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-background/90 backdrop-blur-xl"
  >
    <motion.div initial={{ y: 0 }} exit={{ y: -40, opacity: 0, transition: { duration: 0.6 } }} className="flex flex-col items-center">
      <div className="relative mb-12">
        <div className="w-24 h-24 rounded-[40px] bg-primary/10 flex items-center justify-center animate-pulse">
          <div className="w-14 h-14 rounded-[24px] bg-primary shadow-[0_0_40px_hsl(var(--primary))] animate-bounce" />
        </div>
      </div>
      <div className="w-64 space-y-4">
        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden border border-white/5 relative">
          <motion.div initial={{ width: 0 }} animate={{ width: `${progress || 0}%` }} className="h-full bg-primary shadow-[0_0_20px_hsl(var(--glow))]" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <motion.p key={message} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">{message}</motion.p>
          <span className="text-[12px] font-bold text-muted-foreground tabular-nums">{Math.round(progress || 0)}%</span>
        </div>
      </div>
    </motion.div>
  </motion.div>
)

export const Toast = ({ message, type = 'info', onClose }) => {
  const icons = {
    success: <Check size={16} className="text-primary" />,
    error: <XCircle size={16} className="text-white" />,
    warn: <AlertTriangle size={16} className="text-warning" />,
    info: <Info size={16} className="text-info" />
  }
  const bgColors = {
    success: 'bg-secondary/95',
    error: 'bg-destructive shadow-destructive/20',
    warn: 'bg-secondary/95',
    info: 'bg-secondary/95'
  }
  return (
    <motion.div layout initial={{ opacity: 0, y: -50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9, y: -20, transition: { duration: 0.2 } }}
      className={`flex items-center gap-4 p-4 rounded-2xl backdrop-blur-2xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.35)] min-w-[320px] max-w-md pointer-events-auto group mx-auto ${bgColors[type]}`}
    >
      <div className={`p-2 rounded-lg bg-background/20 border border-white/10 shadow-sm`}>{icons[type]}</div>
      <div className="flex-1 min-w-0"><p className={`text-[13px] font-bold leading-snug text-center px-2 ${type === 'error' ? 'text-destructive-foreground' : 'text-foreground'}`}>{message}</p></div>
      <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 -mr-1 rounded-lg hover:bg-white/10 light:hover:bg-black/5 text-muted-foreground hover:text-foreground transition-all shrink-0" aria-label="Close"><X size={16} /></button>
    </motion.div>
  )
}

export const ToastContainer = ({ children }) => (
  <div className="fixed top-12 left-0 right-0 z-[500] flex flex-col gap-3 pointer-events-none items-center w-full">
    <AnimatePresence mode="popLayout">{children}</AnimatePresence>
  </div>
)
