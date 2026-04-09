import React from 'react'
import { motion } from 'framer-motion'
import { Globe, Folder, RefreshCw, Cpu, Database, FileJson, HardDrive, Terminal, Save, Sun, Moon, Download, CheckCircle2, Edit3, RotateCcw, RefreshCcw, Inbox } from 'lucide-react'
import { Card, Button, Switch, AlertBanner } from '../components/ui'
import { useTranslation } from 'react-i18next'
import type { SettingsPageProps } from '../app/types'
import { pageVariants } from '../app/ui/pageMotion'
import { useApiBridge, useSettingsActions } from '../hooks'

const Settings = ({
  isDriverMissing,
  setIsDriverMissing,
  settings,
  setSettings,
  saveConfig,
  defaultPath,
  systemPaths,
  version,
  showModal,
  theme,
  toggleTheme,
  pushToast,
  updateProgress
}: SettingsPageProps) => {
  const api = useApiBridge()
  const { t, i18n } = useTranslation()
  const { checkingUpdate, isInstallingDriver, isUpToDate, handleUpdateCheck, handleInstallDriver, handlePathChange } =
    useSettingsActions({
      t,
      version,
      showModal,
      setIsDriverMissing,
      pushToast,
      settings,
      setSettings
    })

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8 pb-16">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('settings.title')}</h1>
          <p className="text-sm font-medium text-muted-foreground">{t('settings.desc')}</p>
        </div>
        <Button onClick={() => void saveConfig(true)} icon={Save} className="h-11 font-bold shadow-lg shadow-foreground/5 px-6">
          {t('setup.save_settings')}
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-6">
          {isDriverMissing && (
            <AlertBanner
              variant="error"
              title={t('settings.driver_missing_title')}
              message={t('settings.driver_missing_desc')}
              actions={
                <Button variant="primary" onClick={() => void handleInstallDriver()} loading={isInstallingDriver} className="text-xs font-bold" icon={Download}>
                  {t('settings.driver_missing_action')}
                </Button>
              }
            />
          )}

          <Card title={t('settings.appearance')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 px-1">
                  {theme === 'dark' ? <Moon size={15} className="text-muted-foreground/60" /> : <Sun size={15} className="text-muted-foreground/60" />}
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{t('settings.display_mode')}</span>
                </div>
                <Button variant="secondary" onClick={toggleTheme} className="w-full h-11 font-bold text-xs uppercase tracking-tight">
                  {theme === 'dark' ? t('settings.switch_light') : t('settings.switch_dark')}
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2.5 px-1">
                  <Globe size={15} className="text-muted-foreground/60" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{t('settings.language')}</span>
                </div>
                <div className="flex gap-2">
                  {['vi', 'en'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => void i18n.changeLanguage(lang)}
                      className={`flex-1 h-11 rounded-lg text-xs font-bold transition-all duration-200 border ${
                        i18n.language.startsWith(lang) ? 'bg-foreground text-background border-foreground shadow-md' : 'bg-foreground/[0.02] border-border hover:bg-foreground/[0.05] hover:border-foreground/20'
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card title={t('settings.automation')}>
            <div className="space-y-3 pt-1">
              <Switch
                label={t('settings.auto_refresh')}
                description={t('settings.auto_refresh_desc')}
                icon={RefreshCcw}
                checked={settings.autoRefresh}
                onChange={(val) => setSettings({ ...settings, autoRefresh: val })}
              />
              <Switch
                label={t('settings.minimize_tray')}
                description={t('settings.minimize_tray_desc')}
                icon={Inbox}
                checked={settings.minimizeOnClose}
                onChange={(val) => setSettings({ ...settings, minimizeOnClose: val })}
              />
            </div>
          </Card>

          <Card title={t('settings.paths')}>
            <div className="space-y-6 pt-1">
              <div className="p-5 rounded-xl border border-border/60 bg-foreground/[0.01] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-foreground/5">
                      <Folder size={16} className="text-muted-foreground/80" />
                    </div>
                    <div>
                      <div className="text-sm font-bold tracking-tight">{t('settings.profiles_path')}</div>
                      <div className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">{t('settings.profiles_desc')}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="h-9 w-9 p-0" onClick={() => void handlePathChange()} title={t('settings.change')} icon={Edit3} />
                    <Button variant="outline" className="h-9 w-9 p-0" onClick={() => setSettings({ ...settings, customProfilePath: '' })} title={t('settings.reset')} icon={RotateCcw} />
                  </div>
                </div>
                <div
                  className="px-4 py-3 rounded-lg bg-secondary/80 border border-border/40 text-[11px] font-mono leading-relaxed text-muted-foreground/80 break-all cursor-pointer hover:bg-secondary hover:text-foreground transition-all duration-200"
                  onClick={() => void api.openPath(settings.customProfilePath || defaultPath)}
                >
                  {settings.customProfilePath || defaultPath}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: 'AppData', path: systemPaths.userData, icon: Database },
                  { label: 'Config', path: systemPaths.config, icon: FileJson },
                  { label: 'Temp', path: systemPaths.temp, icon: HardDrive },
                  { label: 'ChromeDriver', path: systemPaths.driver, icon: Terminal }
                ].map((item) => (
                  <div
                    key={item.label}
                    onClick={() => void api.openPath(item.path)}
                    className="group flex items-center gap-3.5 p-4 rounded-xl border border-border bg-foreground/[0.01] hover:bg-foreground/[0.04] hover:border-foreground/20 transition-all duration-200 cursor-pointer"
                  >
                    <div className="p-2 rounded-full bg-foreground/5 text-muted-foreground/60 group-hover:text-foreground/80 transition-colors shrink-0">
                      <item.icon size={15} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold tracking-tight">{item.label}</div>
                      <div className="text-[10px] font-mono text-muted-foreground/40 font-medium truncate mt-0.5">{item.path}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="xl:col-span-4 space-y-6">
          {!isDriverMissing && (
            <Card title={t('settings.driver_status')}>
              <div className="flex items-center gap-4 py-1">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success shrink-0">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <div className="text-sm font-bold tracking-tight">{t('settings.driver_ready')}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mt-0.5">{t('settings.driver_healthy')}</div>
                </div>
              </div>
              <Button variant="outline" onClick={() => void handleInstallDriver()} loading={isInstallingDriver} className="w-full mt-6 h-11 font-bold">
                {t('settings.driver_reinstall')}
              </Button>
            </Card>
          )}

          <Card title={t('settings.update_check')}>
            <div className="space-y-6 text-center py-2">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto transition-all duration-500 ${isUpToDate ? 'bg-success text-white shadow-[0_10px_25px_rgba(34,197,94,0.3)]' : 'bg-secondary border border-border/80 text-muted-foreground'}`}>
                {isUpToDate ? <CheckCircle2 size={24} /> : <RefreshCw size={24} className={checkingUpdate ? 'animate-spin' : ''} />}
              </div>
              <div>
                <div className="text-lg font-bold font-mono tracking-tighter">v{version}</div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">{t('settings.app_platform')}</p>
              </div>
              {isUpToDate && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-[10px] font-bold uppercase tracking-wider mx-auto">
                  <CheckCircle2 size={12} />
                  {t('common.up_to_date')}
                </div>
              )}
              {updateProgress && updateProgress.percent > 0 && (
                <div className="space-y-3">
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-foreground" 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.max(0, updateProgress.percent))}%` }}
                      transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    <span>{t('update.downloading')}</span>
                    <span className="tabular-nums font-mono">{Math.round(updateProgress.percent)}%</span>
                  </div>
                </div>
              )}
              <Button className="w-full h-11 font-bold shadow-lg shadow-foreground/5" loading={checkingUpdate} onClick={() => void handleUpdateCheck()}>
                {t('settings.check_now')}
              </Button>
            </div>
          </Card>

          <Card title={t('settings.app_info')}>
            <div className="space-y-2 pt-1">
              {[
                { label: 'Kernel', value: `v${version}-stable` },
                { label: 'Database', value: 'SQLite 3' },
                { label: 'OS Support', value: 'Windows 10/11' }
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
                  <span className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">{item.label}</span>
                  <span className="text-xs font-bold font-mono tracking-tight">{item.value}</span>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4 h-11 font-bold" onClick={() => api.openExternal("https://github.com/antiantidev/labsgen-tiktok")}>
                <Cpu size={14} className="mr-2" />
                {t('settings.github_repo')}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}

export default Settings
