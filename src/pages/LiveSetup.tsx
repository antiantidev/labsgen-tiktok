import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Type, Gamepad2, Users, Save, RefreshCw, Database, CheckCircle2, XCircle } from 'lucide-react'
import { Card, Button, Input, Checkbox } from '../components/ui'
import { useTranslation } from 'react-i18next'
import type { LiveSetupPageProps } from '../app/types'
import { pageVariants } from '../app/ui/pageMotion'
import { useLiveSetupActions } from '../hooks'

const LiveSetup = ({
  streamTitle,
  setStreamTitle,
  gameCategory,
  handleSearch,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  setGameCategory,
  setGameMaskId,
  mature,
  setMature,
  saveConfig,
  gameMaskId,
  pushToast
}: LiveSetupPageProps) => {
  const { t } = useTranslation()
  const { dropdownRef, controls, isSyncing, localCount, isInvalid, handleSync, onSave, onSelectCategory } =
    useLiveSetupActions({
      t,
      saveConfig,
      pushToast,
      setShowSuggestions,
      setGameCategory,
      setGameMaskId,
      gameMaskId,
      gameCategory
    })

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('setup.title')}</h1>
        <p className="text-sm font-medium text-muted-foreground">{t('setup.desc')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <Card title={t('setup.broadcast_info')} className="relative z-[100] overflow-visible">
            <div className="space-y-6">
              <Input label={t('setup.stream_title')} placeholder={t('setup.title_placeholder')} icon={Type} value={streamTitle} onChange={(e) => setStreamTitle(e.target.value)} />

              <div className="space-y-2">
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
                      className={gameMaskId ? 'border-success/40' : isInvalid ? 'border-destructive/40 ring-4 ring-destructive/5' : ''}
                    />
                  </motion.div>

                  <div className="absolute right-10 top-[38px] pointer-events-none">
                    <AnimatePresence mode="wait">
                      {gameMaskId ? (
                        <motion.div key="success" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                          <CheckCircle2 size={15} className="text-success" />
                        </motion.div>
                      ) : (
                        isInvalid && (
                          <motion.div key="error" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            <XCircle size={15} className="text-destructive" />
                          </motion.div>
                        )
                      )}
                    </AnimatePresence>
                  </div>

                  <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        className="absolute z-[200] w-full bg-background border border-border rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden max-h-[280px] overflow-y-auto mt-2 p-1"
                      >
                        {suggestions.map((cat) => (
                          <button
                            key={cat.game_mask_id}
                            className="group w-full px-4 py-2.5 text-left text-sm rounded-lg hover:bg-foreground/[0.04] transition-all flex items-center justify-between"
                            onClick={() => onSelectCategory(cat)}
                          >
                            <span className="truncate pr-4 text-muted-foreground group-hover:text-foreground">{cat.full_name}</span>
                            <div className="w-5 h-5 rounded-full bg-foreground/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Save size={10} className="text-muted-foreground" />
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center justify-end gap-4 px-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 flex items-center gap-1.5">
                    <Database size={12} />
                    {localCount} {t('setup.cached_categories')}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-border" />
                  <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 hover:text-foreground transition-all duration-200 flex items-center gap-1.5 group"
                  >
                    <RefreshCw size={12} className={isSyncing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
                    {isSyncing ? t('setup.syncing') : t('setup.sync_database')}
                  </button>
                </div>
              </div>
            </div>
          </Card>

          <Card title={t('setup.audience')} className="relative z-10">
            <div className="p-1">
              <Checkbox checked={mature} onChange={setMature} label={t('setup.mature_content')} description={t('setup.mature_desc')} />
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card title={t('setup.actions')}>
            <div className="space-y-4">
              <Button onClick={onSave} icon={Save} className="w-full h-14 text-base font-bold shadow-lg shadow-foreground/5">
                {t('setup.save_settings')}
              </Button>
              <div className="p-5 rounded-xl bg-foreground/[0.02] border border-border/50 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-foreground/5">
                    <Users className="text-muted-foreground" size={16} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-foreground/80">{t('setup.tips')}</span>
                </div>
                <p className="text-xs font-medium text-muted-foreground/60 leading-relaxed">{t('setup.tips_desc')}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}

export default LiveSetup
