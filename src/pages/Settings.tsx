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
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 pb-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{t('settings.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('settings.desc')}</p>
        </div>
        <Button onClick={() => void saveConfig(true)} icon={Save}>
          {t('setup.save_settings')}
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-4">
          {isDriverMissing && (
            <AlertBanner
              variant="error"
              title={t('settings.driver_missing_title')}
              message={t('settings.driver_missing_desc')}
              actions={
                <Button variant="primary" onClick={() => void handleInstallDriver()} loading={isInstallingDriver} className="text-xs" icon={Download}>
                  {t('settings.driver_missing_action')}
                </Button>
              }
            />
          )}

          <Card title={t('settings.appearance')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {theme === 'dark' ? <Moon size={14} className="text-muted-foreground" /> : <Sun size={14} className="text-muted-foreground" />}
                  <span className="text-xs text-muted-foreground">{t('settings.display_mode')}</span>
                </div>
                <Button variant="secondary" onClick={toggleTheme} className="w-full">
                  {theme === 'dark' ? t('settings.switch_light') : t('settings.switch_dark')}
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{t('settings.language')}</span>
                </div>
                <div className="flex gap-1.5">
                  {['vi', 'en'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => void i18n.changeLanguage(lang)}
                      className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors border ${
                        i18n.language.startsWith(lang) ? 'bg-foreground text-background border-foreground' : 'bg-background border-border hover:border-foreground/20'
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
            <div className="space-y-2">
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
            <div className="space-y-4">
              <div className="p-3 rounded-md border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Folder size={14} className="text-muted-foreground" />
                    <div>
                      <span className="text-sm font-medium">{t('settings.profiles_path')}</span>
                      <span className="text-xs text-muted-foreground ml-2">{t('settings.profiles_desc')}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" className="h-7 w-7 p-0" onClick={() => void handlePathChange()} title={t('settings.change')} icon={Edit3} />
                    <Button variant="ghost" className="h-7 w-7 p-0" onClick={() => setSettings({ ...settings, customProfilePath: '' })} title={t('settings.reset')} icon={RotateCcw} />
                  </div>
                </div>
                <div
                  className="px-3 py-2 rounded bg-secondary text-xs font-mono text-muted-foreground break-all cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => void api.openPath(settings.customProfilePath || defaultPath)}
                >
                  {settings.customProfilePath || defaultPath}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { label: 'AppData', path: systemPaths.userData, icon: Database },
                  { label: 'Config', path: systemPaths.config, icon: FileJson },
                  { label: 'Temp', path: systemPaths.temp, icon: HardDrive },
                  { label: 'ChromeDriver', path: systemPaths.driver, icon: Terminal }
                ].map((item) => (
                  <div
                    key={item.label}
                    onClick={() => void api.openPath(item.path)}
                    className="flex items-center gap-2.5 p-2.5 rounded-md border border-border hover:bg-secondary transition-colors cursor-pointer"
                  >
                    <item.icon size={13} className="text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-medium">{item.label}</div>
                      <div className="text-2xs font-mono text-muted-foreground truncate">{item.path}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="xl:col-span-4 space-y-4">
          {!isDriverMissing && (
            <Card title={t('settings.driver_status')}>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-success" />
                <div>
                  <div className="text-sm font-medium">{t('settings.driver_ready')}</div>
                  <div className="text-xs text-muted-foreground">{t('settings.driver_healthy')}</div>
                </div>
              </div>
              <Button variant="outline" onClick={() => void handleInstallDriver()} loading={isInstallingDriver} className="w-full mt-4">
                {t('settings.driver_reinstall')}
              </Button>
            </Card>
          )}

          <Card title={t('settings.update_check')}>
            <div className="space-y-4 text-center">
              <div className={`w-10 h-10 rounded-md flex items-center justify-center mx-auto ${isUpToDate ? 'bg-success/10 text-success' : 'bg-secondary text-muted-foreground'}`}>
                {isUpToDate ? <CheckCircle2 size={18} /> : <RefreshCw size={18} className={checkingUpdate ? 'animate-spin' : ''} />}
              </div>
              <div>
                <div className="text-sm font-semibold font-mono">v{version}</div>
                <p className="text-xs text-muted-foreground mt-0.5">{t('settings.app_platform')}</p>
              </div>
              {isUpToDate && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-2xs font-medium bg-success/10 text-success">
                  <CheckCircle2 size={10} />
                  {t('common.up_to_date')}
                </span>
              )}
              {updateProgress && updateProgress.percent > 0 && (
                <div className="space-y-1.5">
                  <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-foreground transition-all" style={{ width: `${Math.min(100, Math.max(0, updateProgress.percent))}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-2xs text-muted-foreground">
                    <span>{t('update.downloading')}</span>
                    <span className="tabular-nums">{Math.round(updateProgress.percent)}%</span>
                  </div>
                </div>
              )}
              <Button className="w-full" loading={checkingUpdate} onClick={() => void handleUpdateCheck()}>
                {t('settings.check_now')}
              </Button>
            </div>
          </Card>

          <Card title={t('settings.app_info')}>
            <div className="space-y-2">
              {[
                { label: 'Kernel', value: `v${version}-stable` },
                { label: 'Database', value: 'SQLite 3' },
                { label: 'OS Support', value: 'Windows 10/11' }
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <span className="text-xs font-medium font-mono">{item.value}</span>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-3" onClick={() => api.openExternal("https://github.com/antiantidev/labsgen-tiktok")}>
                <Cpu size={12} className="mr-1.5" />
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
