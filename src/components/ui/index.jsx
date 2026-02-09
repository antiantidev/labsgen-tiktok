import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'

export const Button = ({ children, onClick, disabled, variant = 'primary', className = '', icon: Icon, loading }) => {
  const variants = {
    primary: 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30',
    secondary: 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground',
    outline: 'bg-transparent border border-white/10 hover:border-primary/50 hover:text-primary',
    ghost: 'bg-transparent hover:bg-white/5 text-muted-foreground hover:text-foreground',
    danger: 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white',
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

export const Input = ({ label, icon: Icon, ...props }) => (
  <div className="group space-y-2 w-full">
    {label && <label className="text-[10px] uppercase font-black text-muted-foreground ml-1 group-focus-within:text-primary transition-colors">{label}</label>}
    <div className="relative">
      <input 
        {...props}
        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:ring-2 ring-primary/20 outline-none transition-all hover:bg-white/10 focus:bg-black/40 text-sm"
      />
      {Icon && <Icon size={18} className="absolute right-5 top-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />}
    </div>
  </div>
)

export const Checkbox = ({ checked, onChange, label, description }) => (
  <label className="flex items-center gap-4 p-5 rounded-3xl bg-white/5 border border-white/5 cursor-pointer hover:border-primary/30 transition-all group select-none">
    <div className="relative flex items-center justify-center">
      <input 
        type="checkbox" 
        className="sr-only" 
        checked={checked} 
        onChange={(e) => onChange(e.target.checked)} 
      />
      <motion.div 
        animate={checked ? { backgroundColor: 'hsl(var(--primary))', borderColor: 'hsl(var(--primary))' } : { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.1)' }}
        className="w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-colors"
      >
        <AnimatePresence>
          {checked && (
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -45 }}
              transition={{ duration: 0.2 }}
            >
              <Check size={16} className="text-primary-foreground stroke-[4px]" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
    <div className="flex flex-col">
      <span className={`text-sm font-black transition-colors ${checked ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>
        {label}
      </span>
      {description && <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{description}</span>}
    </div>
  </label>
)