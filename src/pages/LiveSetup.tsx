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
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{t('setup.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('setup.desc')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <Card title={t('setup.broadcast_info')} className="relative z-[100] overflow-visible">
            <div className="space-y-5">
              <Input label={t('setup.stream_title')} placeholder={t('setup.title_placeholder')} icon={Type} value={streamTitle} onChange={(e) => setStreamTitle(e.target.value)} />

              <div className="space-y-3">
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
                      className={gameMaskId ? 'border-success/50' : isInvalid ? 'border-destructive/50 ring-2 ring-destructive/10' : ''}
                    />
                  </motion.div>

                  <div className="absolute right-10 top-[38px] pointer-events-none">
                    <AnimatePresence mode="wait">
                      {gameMaskId ? (
                        <motion.div key="success" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                          <CheckCircle2 size={14} className="text-success" />
                        </motion.div>
                      ) : (
                        isInvalid && (
                          <motion.div key="error" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            <XCircle size={14} className="text-destructive" />
                          </motion.div>
                        )
                      )}
                    </AnimatePresence>
                  </div>

                  <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="absolute z-[200] w-full bg-background border border-border rounded-md shadow-lg overflow-hidden max-h-[240px] overflow-y-auto mt-1"
                      >
                        {suggestions.map((cat) => (
                          <button
                            key={cat.game_mask_id}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center justify-between"
                            onClick={() => onSelectCategory(cat)}
                          >
                            <span className="truncate pr-3">{cat.full_name}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <span className="text-2xs text-muted-foreground flex items-center gap-1">
                    <Database size={10} />
                    {localCount} {t('setup.cached_categories')}
                  </span>
                  <span className="text-border">·</span>
                  <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="text-2xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    <RefreshCw size={10} className={isSyncing ? 'animate-spin' : ''} />
                    {isSyncing ? t('setup.syncing') : t('setup.sync_database')}
                  </button>
                </div>
              </div>
            </div>
          </Card>

          <Card title={t('setup.audience')} className="relative z-10">
            <Checkbox checked={mature} onChange={setMature} label={t('setup.mature_content')} description={t('setup.mature_desc')} />
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <Card title={t('setup.actions')}>
            <div className="space-y-3">
              <Button onClick={onSave} icon={Save} className="w-full py-3">
                {t('setup.save_settings')}
              </Button>
              <div className="p-3 rounded-md bg-secondary border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="text-muted-foreground" size={14} />
                  <span className="text-xs font-medium">{t('setup.tips')}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{t('setup.tips_desc')}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}

export default LiveSetup
