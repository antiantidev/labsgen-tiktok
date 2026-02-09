import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { Type, Gamepad2, Users, Save, RefreshCw, Database, CheckCircle2, XCircle } from 'lucide-react'
import { Card, Button, Input, Checkbox } from '../components/ui'
import { useTranslation } from 'react-i18next'

const pageVariants = {
  initial: { opacity: 0, y: 10, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -10, filter: 'blur(10px)', transition: { duration: 0.2 } }
}

const LiveSetup = ({ 
  streamTitle, setStreamTitle, gameCategory, handleSearch,
  suggestions, showSuggestions, setShowSuggestions,
  setGameCategory, setGameMaskId, mature, setMature, saveConfig, gameMaskId, pushToast
}) => {
  const { t } = useTranslation()
  const [isSyncing, setIsSyncing] = useState(false)
  const [localCount, setLocalCount] = useState(0)
  const controls = useAnimation()
  const dropdownRef = useRef(null)

  useEffect(() => {
    const checkCount = async () => {
      const count = await window.api.getCategoryCount()
      setLocalCount(count)
    }
    checkCount()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [setShowSuggestions])

  const handleSync = async () => {
    setIsSyncing(true)
    const res = await window.api.syncCategories()
    if (res.ok) {
      setLocalCount(res.count)
      if (pushToast) pushToast(`Synced ${res.added} new categories`, 'success')
    } else {
      if (pushToast) pushToast(res.error || t('common.error'), 'error')
    }
    setIsSyncing(false)
  }

  const onSave = async () => {
    try {
      const success = await saveConfig(true)
      if (!success) {
        await controls.start({
          x: [-15, 15, -15, 15, -10, 10, -5, 5, 0],
          transition: { duration: 0.5, ease: "linear" }
        })
      }
    } catch (err) {
      console.error("Save error:", err)
      if (pushToast) pushToast("Internal Save Error", "error")
    }
  }

  const onSelectCategory = (cat) => {
    setGameCategory(cat.full_name)
    setGameMaskId(cat.game_mask_id)
    setShowSuggestions(false)
    if (pushToast) pushToast(`${t('common.ready')}: ${cat.full_name}`, 'success')
  }

  const isInvalid = !gameMaskId && gameCategory.trim().length > 0;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black">{t('setup.title')}</h1>
        <p className="text-muted-foreground font-medium">{t('setup.desc')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <Card title={t('setup.broadcast_info')} className="relative z-[100]">
            <div className="space-y-10">
              <Input 
                label={t('setup.stream_title')} 
                placeholder={t('setup.title_placeholder')} 
                icon={Type} 
                value={streamTitle}
                onChange={(e) => setStreamTitle(e.target.value)}
              />

              <div className="space-y-4">
                <div className="relative" ref={dropdownRef}>
                  <motion.div animate={controls}>
                    <Input 
                      label={t('setup.game_category')} 
                      placeholder={t('setup.game_placeholder')} 
                      icon={Gamepad2} 
                      value={gameCategory}
                      onChange={(e) => {
                        handleSearch(e.target.value)
                        if (!showSuggestions) setShowSuggestions(true)
                      }}
                      onFocus={() => (suggestions.length > 0 || gameCategory) && setShowSuggestions(true)}
                      className={gameMaskId ? 'border-primary/50' : (isInvalid ? 'border-destructive/60 ring-4 ring-destructive/10' : '')}
                    />
                  </motion.div>
                  
                  <div className="absolute right-12 top-[46px] pointer-events-none">
                    <AnimatePresence mode="wait">
                      {gameMaskId ? (
                        <motion.div key="success" initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
                          <CheckCircle2 size={18} className="text-primary" />
                        </motion.div>
                      ) : (isInvalid && (
                        <motion.div key="error" initial={{ scale: 0, rotate: 45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
                          <XCircle size={18} className="text-destructive" />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  
                  <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute z-[200] w-full bg-secondary/95 backdrop-blur-xl border border-white/10 light:border-black/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden max-h-[320px] overflow-y-auto custom-scrollbar p-2 mt-6"
                      >
                        {suggestions.map((cat) => (
                          <div key={cat.game_mask_id} className="relative group/item">
                            <button
                              className="w-full px-5 py-4 text-left text-sm font-bold hover:bg-primary/10 hover:text-primary transition-all rounded-2xl flex items-center justify-between"
                              onClick={() => onSelectCategory(cat)}
                            >
                              <span className="truncate pr-4">{cat.full_name}</span>
                              <span className="opacity-0 group-hover/item:opacity-100 transition-all duration-200 text-[9px] font-black uppercase tracking-widest bg-primary text-primary-foreground px-3 py-1.5 rounded-xl shadow-lg shadow-primary/20 pointer-events-none">
                                {t('setup.select')}
                              </span>
                            </button>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Database Info dời xuống đây */}
                <div className="flex items-center justify-end gap-3 px-2">
                  <div className="flex items-center gap-2 text-muted-foreground opacity-40 hover:opacity-100 transition-opacity">
                    <Database size={12} />
                    <span className="text-[9px] font-black uppercase tracking-widest">{localCount} {t('setup.cached_categories')}</span>
                  </div>
                  <div className="w-px h-3 bg-border opacity-20" />
                  <button 
                    onClick={handleSync}
                    disabled={isSyncing}
                    className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-all ${isSyncing ? 'opacity-50' : ''}`}
                  >
                    <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                    {isSyncing ? t('setup.syncing') : t('setup.sync_database')}
                  </button>
                </div>
              </div>
            </div>
          </Card>

          <Card title={t('setup.audience')} className="relative z-10">
            <div className="p-5 rounded-3xl bg-secondary/50 border border-border hover:border-primary/20 transition-all">
              <Checkbox 
                checked={mature} 
                onChange={setMature} 
                label={t('setup.mature_content')} 
                description={t('setup.mature_desc')} 
              />
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <Card title={t('setup.actions')}>
            <div className="space-y-4">
              <Button onClick={onSave} icon={Save} className="w-full py-6">
                {t('setup.save_settings')}
              </Button>
              <div className="p-6 rounded-[32px] bg-secondary/50 border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="text-primary" size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{t('setup.tips')}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                  {t('setup.tips_desc')}
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
