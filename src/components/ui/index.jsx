import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Info, AlertTriangle, XCircle, ChevronRight, AlertCircle } from 'lucide-react'

export const Button = ({ children, onClick, disabled, variant = 'primary', className = '', icon: Icon, loading }) => {
  const variants = {
    primary: 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-muted transition-colors',
    outline: 'bg-transparent border border-border hover:border-primary/50 hover:text-primary',
    ghost: 'bg-transparent hover:bg-secondary text-muted-foreground hover:text-foreground',
    danger: 'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-destructive-foreground',
  }

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02, y: -1 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-30 ${variants[variant]} ${className}`}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon && <Icon size={16} />}
      {children}
    </motion.button>
  )
}

export const Card = ({ children, title, className = "", onClick }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={onClick}
    className={`glass border rounded-3xl p-6 transition-all group ${onClick ? 'cursor-pointer hover:border-primary/30' : ''} ${className}`}
  >
    {title && <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-5 group-hover:text-primary transition-colors">{title}</h3>}
    {children}
  </motion.div>
)

export const AlertBanner = ({ title, message, variant = 'warn', actions }) => {
  const styles = {
    warn: 'bg-warning/10 border-warning/20 text-warning',
    error: 'bg-destructive/10 border-destructive/20 text-destructive',
    info: 'bg-info/10 border-info/20 text-info'
  }
  return (
    <div className={`p-6 rounded-[32px] border flex items-start gap-5 ${styles[variant]}`}>
      <div className="p-3 rounded-2xl bg-background/50 border border-current/10 shrink-0">
        <AlertCircle size={24} />
      </div>
      <div className="flex-1 space-y-1">
        <h4 className="font-black text-sm uppercase tracking-widest leading-none">{title}</h4>
        <p className="text-[11px] font-bold opacity-80 leading-relaxed">{message}</p>
        {actions && <div className="pt-3 flex gap-3">{actions}</div>}
      </div>
    </div>
  )
}

export const Input = ({ label, icon: Icon, className = "", ...props }) => (
  <div className="group space-y-2 w-full">
    {label && <label className="text-[10px] uppercase font-black text-muted-foreground ml-1 group-focus-within:text-primary transition-colors">{label}</label>}
    <div className="relative">
      <input 
        {...props}
        className={`w-full bg-secondary border border-border rounded-2xl px-5 py-3.5 focus:ring-2 ring-primary/20 outline-none transition-all hover:bg-muted focus:bg-background text-sm ${className}`}
      />
      {Icon && <Icon size={18} className="absolute right-5 top-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />}
    </div>
  </div>
)

export const Checkbox = ({ checked, onChange, label, description }) => (
  <label className="flex items-center gap-4 cursor-pointer group select-none">
    <div className="relative flex items-center justify-center">
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <motion.div 
        animate={checked ? { backgroundColor: 'hsl(var(--primary))', borderColor: 'hsl(var(--primary))' } : { backgroundColor: 'transparent', borderColor: 'hsl(var(--border))' }}
        className="w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-colors"
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
    <div className="flex flex-col">
      <span className={`text-sm font-black transition-colors ${checked ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>{label}</span>
      {description && <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{description}</span>}
    </div>
  </label>
)

export const Switch = ({ checked, onChange, label, description }) => (
  <label className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 border border-border hover:border-primary/30 transition-all cursor-pointer group">
    <div className="flex flex-col">
      <span className="text-sm font-bold group-hover:text-primary transition-colors">{label}</span>
      {description && <span className="text-[10px] text-muted-foreground">{description}</span>}
    </div>
    <div className="relative inline-flex items-center">
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
  <div className={`skeleton ${className}`} />
)

export const LoadingOverlay = ({ message, progress }) => (

  <motion.div 

    exit={{ 

      opacity: 0, 

      scale: 1.05, 

      filter: 'blur(20px)',

      transition: { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] } 

    }}

    className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-background backdrop-blur-md"

  >

    <motion.div 

      initial={{ y: 0 }}

      exit={{ y: -40, opacity: 0, transition: { duration: 0.6 } }}

      className="flex flex-col items-center"

    >
      <div className="relative mb-12">
        <div className="w-24 h-24 rounded-[40px] bg-primary/10 flex items-center justify-center animate-pulse">
          <div className="w-14 h-14 rounded-[32px] bg-primary shadow-[0_0_40px_hsl(var(--primary))] animate-bounce" />
        </div>
      </div>
      <div className="w-64 space-y-4">
        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden border border-white/5 relative">
          <motion.div initial={{ width: 0 }} animate={{ width: `${progress || 0}%` }} className="h-full bg-primary shadow-[0_0_15px_hsl(var(--primary))]" />
        </div>
        <div className="flex justify-between items-center px-1">
          <motion.p key={message} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">{message}</motion.p>
          <span className="text-[10px] font-black text-muted-foreground tabular-nums">{Math.round(progress || 0)}%</span>
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
    success: 'bg-secondary/90',
    error: 'bg-destructive shadow-destructive/20',
    warn: 'bg-secondary/90',
    info: 'bg-secondary/90'
  }
  return (
    <motion.div layout initial={{ opacity: 0, y: -50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9, y: -20, transition: { duration: 0.2 } }}
      className={`flex items-center gap-4 p-4 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl min-w-[320px] max-w-md pointer-events-auto group mx-auto ${bgColors[type]}`}
    >
      <div className={`p-2 rounded-xl bg-background/20 border border-white/10 shadow-sm`}>{icons[type]}</div>
      <div className="flex-1 min-w-0"><p className={`text-xs font-black leading-tight text-center px-2 ${type === 'error' ? 'text-destructive-foreground' : 'text-foreground'}`}>{message}</p></div>
      <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 -mr-1 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-all shrink-0" aria-label="Close"><X size={16} /></button>
    </motion.div>
  )
}

export const ToastContainer = ({ children }) => (
  <div className="fixed top-12 left-0 right-0 z-[500] flex flex-col gap-3 pointer-events-none items-center w-full">
    <AnimatePresence mode="popLayout">{children}</AnimatePresence>
  </div>
)
