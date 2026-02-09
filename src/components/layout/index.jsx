import React from 'react'
import { motion } from 'framer-motion'

export const Titlebar = () => (
  <header className="h-20 border-b border-border/60 light:border-black/10 flex items-center justify-end px-8 gap-3 drag z-[100] shrink-0 bg-background/40 light:bg-white/70 backdrop-blur-xl">
    <motion.button 
      whileHover={{ scale: 1.1 }} 
      whileTap={{ scale: 0.9 }} 
      onClick={() => window.api.windowMinimize()} 
      className="no-drag w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-white/10 light:hover:bg-black/5 text-muted-foreground light:text-foreground/80 hover:text-foreground transition-colors"
    >
      <div className="w-4 h-0.5 rounded-full bg-current" />
    </motion.button>
    <motion.button 
      whileHover={{ scale: 1.1 }} 
      whileTap={{ scale: 0.9 }} 
      onClick={() => window.api.windowMaximize()} 
      className="no-drag w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-white/10 light:hover:bg-black/5 text-muted-foreground light:text-foreground/80 hover:text-foreground transition-colors"
    >
      <div className="w-3.5 h-3.5 border-2 border-current rounded-md" />
    </motion.button>
    <motion.button 
      whileHover={{ scale: 1.1 }} 
      whileTap={{ scale: 0.9 }} 
      onClick={() => window.api.windowClose()} 
      className="no-drag w-10 h-10 flex items-center justify-center rounded-2xl text-muted-foreground light:text-foreground/80 hover:text-rose-500 hover:bg-rose-500/15 light:hover:bg-rose-500/10 transition-all"
    >
      <div className="relative w-4 h-4">
        <span className="absolute left-1/2 top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-current rounded-full" />
        <span className="absolute left-1/2 top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-current rounded-full" />
      </div>
    </motion.button>
  </header>
)

export const PageContainer = ({ children }) => (
  <div className="flex-1 overflow-y-auto custom-scrollbar relative z-0">
    <div className="max-w-6xl mx-auto px-10 pt-8 pb-10">
      {children}
    </div>
  </div>
)
