import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FolderOpen, Cpu, Sparkles, Monitor, RotateCcw, Save, ExternalLink, RefreshCw, ShieldCheck, FileCode, HardDrive, Database, AppWindow } from 'lucide-react'
import { Card, Button, Input } from '../components/ui'
import { useTranslation } from 'react-i18next'

const pageVariants = {
  initial: { opacity: 0, y: 10, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -10, filter: 'blur(10px)', transition: { duration: 0.2 } }
}

const PathRow = ({ label, path, icon: Icon, onOpen }) => (
  <div className="space-y-2 group">
    <div className="flex items-center justify-between ml-1">
      <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] group-hover:text-primary transition-colors">{label}</label>
    </div>
    <div className="flex gap-3 items-center">
      <div className="flex-1 bg-secondary border border-border rounded-2xl px-5 py-3 text-[10px] font-mono text-muted-foreground break-all flex items-center min-h-[44px] leading-relaxed relative overflow-hidden">
        <div className="absolute left-0 top-0 w-1 h-full bg-primary/10 group-hover:bg-primary/30 transition-all" />
        {path || 'N/A'}
      </div>
      <button 
        onClick={() => onOpen(path)}
        className="p-3 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-all shadow-sm shrink-0"
        title="Open Location"
      >
        <Icon size={16} />
      </button>
    </div>
  </div>
)

const Settings = ({ settings, setSettings, saveConfig, defaultPath, systemPaths, version, showModal }) => {
  const { t } = useTranslation()
  const [checkingUpdate, setCheckingUpdate] = useState(false)

  const handleSelectFolder = async () => {
    const path = await window.api.selectFolder()
    if (path) {
      setSettings({ ...settings, customProfilePath: path })
    }
  }

  const handleOpenFolder = (path) => {
    if (!path) return;
    window.api.openPath(path);
  }

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true)
    try {
      const res = await window.api.checkForUpdates()
      if (res.ok && res.devMode) {
        await showModal(
          'Development Mode',
          'Automatic updates are disabled in development mode. Build the application to test this feature.',
          [{ label: t('common.ok'), value: true }]
        )
      } else if (res.ok && res.upToDate) {
        await showModal(
          t('update.up_to_date'),
          `${t('update.up_to_date_desc')} LabsGen TikTok (v${version}).`,
          [{ label: t('common.ok'), value: true }]
        )
      } else if (!res.ok) {
        await showModal(t('common.error'), res.error)
      }
    } catch (err) {
      await showModal(t('common.error'), String(err))
    } finally {
      setTimeout(() => setCheckingUpdate(false), 500)
    }
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">{t('sidebar.settings') || 'Settings'}</h1>
          <p className="text-muted-foreground font-medium">Customize your experience and system paths.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setSettings({
            customProfilePath: '',
            autoRefresh: true,
            captureDelay: 5000,
            themeColor: '#31fb9a'
          })} icon={RotateCcw}>Reset All</Button>
          <Button onClick={() => saveConfig(true)} icon={Save}>{t('common.save')}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Card title="System Paths">
            <div className="space-y-6">
              {/* Profile Path with Select button */}
              <div className="space-y-2 group">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] group-hover:text-primary transition-colors">Chrome Profiles Directory</label>
                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${settings.customProfilePath ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-500'}`}>
                    {settings.customProfilePath ? 'CUSTOM' : 'DEFAULT'}
                  </span>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="flex-1 bg-secondary border border-border rounded-2xl px-5 py-3 text-[10px] font-mono text-muted-foreground break-all flex items-center min-h-[44px] leading-relaxed relative overflow-hidden">
                    <div className="absolute left-0 top-0 w-1 h-full bg-primary/10 group-hover:bg-primary/30 transition-all" />
                    {settings.customProfilePath || defaultPath}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button 
                      onClick={handleSelectFolder}
                      className="p-2.5 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-primary transition-all shadow-sm"
                      title="Select New Folder"
                    >
                      <FolderOpen size={14} />
                    </button>
                    <button 
                      onClick={() => handleOpenFolder(settings.customProfilePath || defaultPath)}
                      className="p-2.5 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-primary transition-all shadow-sm"
                      title="Open Current Folder"
                    >
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="divider-x opacity-10" />

              {/* Other System Paths */}
              <PathRow label="Application Source" path={systemPaths.app} icon={AppWindow} onOpen={handleOpenFolder} />
              <PathRow label="User Data Folder" path={systemPaths.userData} icon={Database} onOpen={handleOpenFolder} />
              <PathRow label="Config File" path={systemPaths.config} icon={FileCode} onOpen={(p) => window.api.openPath(require('path').dirname(p))} />
              <PathRow label="ChromeDriver Binary" path={systemPaths.driver} icon={Cpu} onOpen={(p) => window.api.openPath(require('path').dirname(p))} />
            </div>
          </Card>

          <Card title="Software Update">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary border border-border">
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Version {version}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Current Release</span>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleCheckUpdate} 
                  loading={checkingUpdate}
                  icon={RefreshCw}
                  className="h-10"
                >
                  Check for Updates
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card title="Automation Behavior">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary border border-border">
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Auto-refresh Account</span>
                  <span className="text-[10px] text-muted-foreground">Verify token status on application startup.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.autoRefresh} 
                  onChange={(e) => setSettings({...settings, autoRefresh: e.target.checked})}
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary border border-border">
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Minimize to System Tray</span>
                  <span className="text-[10px] text-muted-foreground">Hide to system tray instead of quitting when clicking [X].</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.minimizeOnClose} 
                  onChange={(e) => setSettings({...settings, minimizeOnClose: e.target.checked})}
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Web Capture Delay (ms)</label>
                <Input 
                  type="number" 
                  value={settings.captureDelay} 
                  onChange={(e) => setSettings({...settings, captureDelay: parseInt(e.target.value) || 0})}
                  placeholder="5000"
                />
                <p className="text-[10px] text-zinc-500 italic">Wait time for redirection. Increase if your internet is slow.</p>
              </div>
            </div>
          </Card>

          <Card title="Visual Identity">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Primary Theme Color</label>
                <div className="flex gap-3">
                  {['#31fb9a', '#3b82f6', '#a855f7', '#f43f5e', '#eab308'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setSettings({...settings, themeColor: color})}
                      className={`w-10 h-10 rounded-xl border-4 transition-all ${settings.themeColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-primary/5 border border-primary/20 space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <Sparkles size={20} />
                  <span className="text-xs font-black uppercase tracking-widest">Personalization</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  More UI options like background patterns and glass intensity coming soon.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}

export default Settings
