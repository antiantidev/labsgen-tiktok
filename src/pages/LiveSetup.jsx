import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Info, AlertCircle, Save } from 'lucide-react'
import { Card, Button, Input, Checkbox } from '../components/ui'

const pageVariants = {
  initial: { opacity: 0, y: 10, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -10, filter: 'blur(10px)', transition: { duration: 0.2 } }
}

const LiveSetup = ({ 
  streamTitle, setStreamTitle, 
  gameCategory, handleSearch, 
  suggestions, showSuggestions, setShowSuggestions, setGameCategory, setGameMaskId,
  mature, setMature,
  saveConfig
}) => (
  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-black">Live Setup</h1>
        <p className="text-muted-foreground font-medium">Define your broadcast identity and audience settings.</p>
      </div>
      <Button variant="outline" onClick={() => saveConfig(true)} icon={Save}>Save Config</Button>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-8">
        <Card title="Broadcast Content">
          <div className="space-y-6">
            <Input 
              label="Stream Title" 
              placeholder="What are you streaming today?" 
              value={streamTitle} 
              onChange={(e) => setStreamTitle(e.target.value)} 
            />
            
            <div className="group relative">
              <Input 
                label="Game Category" 
                placeholder="Search for a game..." 
                value={gameCategory} 
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              />
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }} 
                    className="absolute z-50 mt-2 w-full bg-[#0d0d0d] border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto custom-scrollbar"
                  >
                    {suggestions.map((c, i) => (
                      <button 
                        key={i} 
                        onClick={() => { setGameCategory(c.full_name); setGameMaskId(c.game_mask_id || ''); setShowSuggestions(false); }} 
                        className="w-full text-left px-5 py-3 text-sm hover:bg-primary/10 hover:text-primary transition-colors border-b border-white/5 last:border-0"
                      >
                        {c.full_name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Card>

        <Card title="Audience Control">
          <div className="space-y-4">
            <Checkbox 
              checked={mature} 
              onChange={setMature} 
              label="Mature Content (18+)" 
              description="Restrict stream to adult viewers only" 
            />
            
            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex gap-4">
              <Info className="text-blue-400 shrink-0" size={20} />
              <p className="text-[11px] text-blue-200/50 leading-relaxed">
                Choosing the correct category helps TikTok recommend your stream to the right audience.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-8">
        <Card title="Stream Optimization">
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-black/40 border border-white/5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">1</div>
                <span className="text-xs font-black uppercase tracking-widest">Portrait Mode</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">Set your canvas to 1080x1920 for the best TikTok experience on mobile devices.</p>
            </div>

            <div className="p-6 rounded-3xl bg-black/40 border border-white/5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">2</div>
                <span className="text-xs font-black uppercase tracking-widest">High Bitrate</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">Use a bitrate between 4000-6000 Kbps for high-quality gaming streams.</p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-4">
              <AlertCircle className="text-amber-500 shrink-0" size={20} />
              <p className="text-[11px] text-amber-200/50 font-medium leading-relaxed">
                Changes saved here will take effect the next time you start a broadcast.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </motion.div>
)

export default LiveSetup