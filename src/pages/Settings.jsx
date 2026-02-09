import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Globe, Folder, RefreshCw, Cpu, Database, FileJson, HardDrive, Terminal, Heart, Layout, Bell, Save, Sun, Moon, ShieldAlert, Download, CheckCircle2, Edit3, RotateCcw, RefreshCcw, Inbox } from 'lucide-react'
import { Card, Button, Input, Switch, AlertBanner } from '../components/ui'
import { useTranslation } from 'react-i18next'

const pageVariants = {
  initial: { opacity: 0, y: 10, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -10, filter: 'blur(10px)', transition: { duration: 0.2 } }
}

const Settings = ({ isDriverMissing, setIsDriverMissing, settings, setSettings, saveConfig, defaultPath, systemPaths, version, showModal, theme, toggleTheme, pushToast }) => {
  const { t, i18n } = useTranslation()
  const [checkingUpdate, setCheckingUpdate] = useState(false)
  const [isInstallingDriver, setIsDriverInstalling] = useState(false)
  const [isUpToDate, setIsUpToDate] = useState(false)

  const handleUpdateCheck = async () => {
    setCheckingUpdate(true)
    const startedAt = Date.now()
    const res = await window.api.checkForUpdates()
    const elapsed = Date.now() - startedAt
    if (elapsed < 700) await new Promise(r => setTimeout(r, 700 - elapsed))
    setCheckingUpdate(false)
    if (res.ok && res.upToDate) {
      setIsUpToDate(true)
      await showModal(t('common.up_to_date'), `${t('common.up_to_date_desc')} LABGEN TIKTOK (v${version})`)
    } else {
      setIsUpToDate(false)
    }
  }

  const handleInstallDriver = async () => {
    setIsDriverInstalling(true)
    const res = await window.api.bootstrapDriver()
    setIsDriverInstalling(false)
    if (res.ok) {
      setIsDriverMissing(false)
      if (pushToast) pushToast("ChromeDriver installed successfully", "success")
    } else {
      if (pushToast) pushToast(res.error, "error")
    }
  }

  const handlePathChange = async () => {
    const path = await window.api.selectFolder()
    if (path) {
      setSettings({ ...settings, customProfilePath: path })
    }
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-10 pb-20">
      <div className="space-y-1">
        <h1 className="text-3xl font-black">{t('settings.title')}</h1>
        <p className="text-muted-foreground font-medium text-sm">{t('settings.desc')}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-8 space-y-10">
          
          {isDriverMissing && (
            <AlertBanner 
              variant="error"
              title={t('settings.driver_missing_title')}
              message={t('settings.driver_missing_desc')}
              actions={
                <Button variant="primary" onClick={handleInstallDriver} loading={isInstallingDriver} className="h-10 px-6 rounded-xl text-xs" icon={Download}>
                  {t('settings.driver_missing_action')}
                </Button>
              }
            />
          )}

          <Card title={t('settings.appearance')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Moon className="text-primary" size={18} /> : <Sun className="text-primary" size={18} />}
                  <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('settings.display_mode')}</span>
                </div>
                <Button variant="secondary" onClick={toggleTheme} className="w-full h-12 rounded-xl text-xs">
                  {theme === 'dark' ? t('settings.switch_light') : t('settings.switch_dark')}
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Globe className="text-primary" size={18} />
                  <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('settings.language')}</span>
                </div>
                <div className="flex gap-2">
                  {['vi', 'en'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => i18n.changeLanguage(lang)}
                      className={`flex-1 h-12 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border ${i18n.language.startsWith(lang) ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary border-border light:bg-white/70 light:border-black/5 hover:border-primary/30'}`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card title={t('settings.automation')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Switch 
                label={t('settings.auto_refresh')}
                description={t('settings.auto_refresh_desc')}
                icon={RefreshCcw}
                checked={settings.autoRefresh}
                onChange={(val) => setSettings({...settings, autoRefresh: val})}
              />
              <Switch 
                label={t('settings.minimize_tray')}
                description={t('settings.minimize_tray_desc')}
                icon={Inbox}
                checked={settings.minimizeOnClose}
                onChange={(val) => setSettings({...settings, minimizeOnClose: val})}
              />
            </div>
          </Card>

          <Card title={t('settings.paths')}>
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-secondary/50 border border-border light:bg-white/70 light:border-black/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary"><Folder size={18} /></div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black uppercase tracking-widest">{t('settings.profiles_path')}</span>
                      <span className="text-[12px] font-medium text-muted-foreground">{t('settings.profiles_desc')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="h-10 w-10 p-0 rounded-lg" onClick={handlePathChange} title={t('settings.change')} icon={Edit3} />
                    <Button variant="secondary" className="h-10 w-10 p-0 rounded-lg border border-white/5 light:border-black/5" onClick={() => setSettings({ ...settings, customProfilePath: '' })} title={t('settings.reset')} icon={RotateCcw} />
                  </div>
                </div>
                <div 
                  className="p-4 rounded-xl bg-background border border-border light:bg-white/70 light:border-black/5 text-[12px] font-mono font-medium text-muted-foreground break-all cursor-pointer hover:text-primary transition-colors"
                  onClick={() => window.api.openPath(settings.customProfilePath || defaultPath)}
                >
                  {settings.customProfilePath || defaultPath}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'AppData', path: systemPaths.userData, icon: Database },
                  { label: 'Config', path: systemPaths.config, icon: FileJson },
                  { label: 'Temp', path: systemPaths.temp, icon: HardDrive },
                  { label: 'ChromeDriver', path: systemPaths.driver, icon: Terminal }
                ].map((item) => (
                  <div 
                    key={item.label}
                    onClick={() => window.api.openPath(item.path)}
                    className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border light:bg-white/70 light:border-black/5 hover:border-primary/20 hover:bg-secondary/50 transition-all cursor-pointer group"
                  >
                    <div className="p-2.5 rounded-lg bg-secondary text-muted-foreground group-hover:text-primary transition-colors"><item.icon size={16} /></div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">{item.label}</span>
                      <span className="text-[12px] font-bold truncate opacity-60 font-mono">{item.path}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="xl:col-span-4 space-y-10">
          {!isDriverMissing && (
            <Card title={t('settings.driver_status')}>
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-lg bg-primary/10 text-primary">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h4 className="font-black text-[13px] uppercase tracking-wide">{t('settings.driver_ready')}</h4>
                  <p className="text-[12px] font-medium text-muted-foreground">{t('settings.driver_healthy')}</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleInstallDriver} loading={isInstallingDriver} className="w-full mt-6 h-12 text-xs">{t('settings.driver_reinstall')}</Button>
            </Card>
          )}

          <Card title={t('settings.update_check')}>
            <div className="space-y-6 text-center">
              <div className={`w-20 h-20 rounded-[24px] flex items-center justify-center mx-auto ${isUpToDate ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                {isUpToDate ? (
                  <CheckCircle2 size={32} />
                ) : (
                  <RefreshCw size={32} className={checkingUpdate ? 'animate-spin' : ''} />
                )}
              </div>
              <div>
                <h4 className="font-black text-sm uppercase tracking-widest">v{version}</h4>
                <p className="text-[12px] font-medium text-muted-foreground mt-1">{t('settings.app_platform')}</p>
              </div>
              {isUpToDate && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-success/10 text-success border border-success/20 mx-auto">
                  <CheckCircle2 size={12} />
                  {t('common.up_to_date')}
                </div>
              )}
              <Button className="w-full h-14 text-xs" loading={checkingUpdate} onClick={handleUpdateCheck}>{t('settings.check_now')}</Button>
            </div>
          </Card>

          <Card title={t('settings.app_info')}>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-white/5 light:border-black/5">
                <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Kernel</span>
                <span className="text-[12px] font-bold font-mono">v{version}-stable</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5 light:border-black/5">
                <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Database</span>
                <span className="text-[12px] font-bold font-mono text-primary">SQLite 3</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">OS Support</span>
                <span className="text-[12px] font-bold font-mono">Windows 10/11</span>
              </div>
              <Button variant="outline" className="w-full mt-4 h-12 text-xs" onClick={() => window.api.openExternal("https://github.com/antiantidev/labs-gen-tik")}>
                <Cpu size={14} className="mr-2" />
                {t('settings.github_repo')}
              </Button>
            </div>
          </Card>

          <Button className="w-full py-4 h-auto flex-col gap-1 rounded-xl shadow-xl" onClick={() => saveConfig(true)} icon={Save}>
            <span className="text-[11px] font-black uppercase tracking-widest">{t('setup.save_settings')}</span>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export default Settings
