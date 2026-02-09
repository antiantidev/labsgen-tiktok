import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Info, AlertCircle, Save } from 'lucide-react'
import { Card, Button, Input, Checkbox } from '../components/ui'
import { useTranslation } from 'react-i18next'

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
}) => {
  const { t } = useTranslation()

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">{t('setup.title')}</h1>
          <p className="text-muted-foreground font-medium">{t('setup.desc')}</p>
        </div>
        <Button variant="outline" onClick={() => saveConfig(true)} icon={Save}>{t('common.save_config')}</Button>
      </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <Card title={t('setup.content')} className="relative z-[60]">
                <div className="space-y-6">
                  <Input 
                    label={t('setup.stream_title')} 
                    placeholder={t('setup.title_placeholder')} 
                    value={streamTitle} 
                    onChange={(e) => setStreamTitle(e.target.value)} 
                  />
                  
                  <div className="group relative">
                    <Input 
                      label={t('setup.game_category')} 
                      placeholder={t('setup.game_placeholder')} 
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
                          className="absolute z-[100] mt-2 w-full bg-popover border border-border rounded-2xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto custom-scrollbar"
                        >
                          {suggestions.map((c, i) => (
                            <button 
                              key={i} 
                              onClick={() => { setGameCategory(c.full_name); setGameMaskId(c.game_mask_id || ''); setShowSuggestions(false); }} 
                              className="w-full text-left px-5 py-3 text-sm hover:bg-primary/10 hover:text-primary transition-colors border-b border-border last:border-0"
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
      
              <Card title={t('setup.audience')} className="relative z-10">            <div className="space-y-4">
              <Checkbox 
                checked={mature} 
                onChange={setMature} 
                label={t('setup.mature')} 
                description={t('setup.mature_desc')} 
              />
              
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex gap-4">
                <Info className="text-blue-500 shrink-0" size={20} />
                <p className="text-[11px] text-blue-600 dark:text-blue-200/70 font-bold leading-relaxed">
                  {t('setup.category_info')}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card title={t('setup.optimization')}>
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-secondary border border-border space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">1</div>
                  <span className="text-xs font-black uppercase tracking-widest">{t('setup.portrait')}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{t('setup.portrait_desc')}</p>
              </div>

              <div className="p-6 rounded-3xl bg-secondary border border-border space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">2</div>
                  <span className="text-xs font-black uppercase tracking-widest">{t('setup.bitrate')}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{t('setup.bitrate_desc')}</p>
              </div>

              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-4">
                <AlertCircle className="text-amber-600 dark:text-amber-500 shrink-0" size={20} />
                <p className="text-[11px] text-amber-700 dark:text-amber-200/70 font-bold leading-relaxed">
                  {t('setup.save_warning')}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}

export default LiveSetup