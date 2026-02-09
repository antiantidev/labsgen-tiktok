import React from 'react'
import { motion } from 'framer-motion'

export const Titlebar = () => (
  <header className="h-20 border-b border-border/60 flex items-center justify-end px-8 gap-3 drag z-[100] shrink-0 bg-background/40 backdrop-blur-xl">
    <motion.button 
      whileHover={{ scale: 1.1 }} 
      whileTap={{ scale: 0.9 }} 
      onClick={() => window.api.windowMinimize()} 
      className="no-drag w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
    >
      <span className="text-2xl mt-[-10px]">_</span>
    </motion.button>
    <motion.button 
      whileHover={{ scale: 1.1 }} 
      whileTap={{ scale: 0.9 }} 
      onClick={() => window.api.windowMaximize()} 
      className="no-drag w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
    >
      <div className="w-3.5 h-3.5 border-2 border-current rounded-md" />
    </motion.button>
    <motion.button 
      whileHover={{ scale: 1.1, backgroundColor: "rgba(244,63,94,0.15)" }} 
      whileTap={{ scale: 0.9 }} 
      onClick={() => window.api.windowClose()} 
      className="no-drag w-10 h-10 flex items-center justify-center rounded-2xl text-muted-foreground hover:text-rose-500 transition-all"
    >
      <span className="text-2xl">×</span>
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
