import React from 'react'
import { motion } from 'framer-motion'
import { FolderOpen, Cpu, Sparkles, Monitor, RotateCcw, Save, ExternalLink } from 'lucide-react'
import { Card, Button, Input } from '../components/ui'
import { useTranslation } from 'react-i18next'

const pageVariants = {
  initial: { opacity: 0, y: 10, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -10, filter: 'blur(10px)', transition: { duration: 0.2 } }
}

const Settings = ({ settings, setSettings, saveConfig, defaultPath }) => {
  const { t } = useTranslation()

  const handleSelectFolder = async () => {
    const path = await window.api.selectFolder()
    if (path) {
      setSettings({ ...settings, customProfilePath: path })
    }
  }

  const handleOpenFolder = () => {
    const path = settings.customProfilePath || defaultPath;
    window.api.openPath(path);
  }

  const currentPath = settings.customProfilePath || defaultPath || 'Loading...';

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">{t('sidebar.settings') || 'Settings'}</h1>
          <p className="text-muted-foreground font-medium">Customize your experience and system paths.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setSettings({...settings, customProfilePath: ''})} icon={RotateCcw}>Restore Default</Button>
          <Button onClick={() => saveConfig(true)} icon={Save}>{t('common.save')}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Card title="System Paths">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Chrome Profiles Directory</label>
                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${settings.customProfilePath ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-500'}`}>
                    {settings.customProfilePath ? 'CUSTOM' : 'DEFAULT'}
                  </span>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="flex-1 bg-secondary border border-border rounded-2xl px-5 py-3 text-[11px] font-mono text-muted-foreground break-all flex items-center min-h-[48px] leading-relaxed">
                    {currentPath}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button 
                      onClick={handleSelectFolder}
                      className="p-3 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-all shadow-sm"
                      title="Select New Folder"
                    >
                      <FolderOpen size={18} />
                    </button>
                    <button 
                      onClick={handleOpenFolder}
                      className="p-3 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-all shadow-sm"
                      title="Open Current Folder"
                    >
                      <ExternalLink size={18} />
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-zinc-500 italic mt-1">Cookies and login sessions are stored here for each account.</p>
              </div>
            </div>
          </Card>

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
                  className="w-5 h-5 accent-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Web Capture Delay (ms)</label>
                <Input 
                  type="number" 
                  value={settings.captureDelay} 
                  onChange={(e) => setSettings({...settings, captureDelay: parseInt(e.target.value)})}
                  placeholder="5000"
                />
                <p className="text-[10px] text-zinc-500 italic">Wait time before exchanging code for token. Increase if login is slow.</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
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
                  <span className="text-xs font-black uppercase tracking-widest">Experimental</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  More UI customization options (background patterns, blur intensity) will be available in future updates.
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