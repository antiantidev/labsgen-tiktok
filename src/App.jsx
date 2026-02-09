import React, { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

// Layout & UI
import { Sidebar } from './components/layout/Sidebar'
import { Titlebar, PageContainer } from './components/layout'
import { Button, LoadingOverlay, Toast, ToastContainer } from './components/ui'

// Pages
import Dashboard from './pages/Dashboard'
import Console from './pages/Console'
import LiveSetup from './pages/LiveSetup'
import TokenVault from './pages/TokenVault'
import Pulse from './pages/Pulse'
import Settings from './pages/Settings'

const App = () => {
  const { t, i18n } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [loadProgress, setLoadProgress] = useState(0)
  const [toasts, setToasts] = useState([])
  
  const [currentPage, setCurrentPage] = useState('home')
  const [theme, setTheme] = useState('dark')
  const [appVersion, setAppVersion] = useState('0.0.0')
  const [defaultPath, setDefaultPath] = useState('')
  const [systemPaths, setSystemPaths] = useState({})
  
  // Settings State
  const [settings, setSettings] = useState({
    customProfilePath: '',
    autoRefresh: true,
    minimizeOnClose: false,
    captureDelay: 5000,
    themeColor: '#31fb9a'
  })

  // Account Management State (Powered by SQLite)
  const [accounts, setAccounts] = useState([])
  const [activeAccountId, setActiveAccountId] = useState(null)
  const [token, setToken] = useState('')
  
  const [showToken, setShowToken] = useState(false)
  const [streamTitle, setStreamTitle] = useState('')
  const [gameCategory, setGameCategory] = useState('')
  const [gameMaskId, setGameMaskId] = useState('')
  const [mature, setMature] = useState(false)
  const [isWebLoading, setIsWebLoading] = useState(false)
  const [status, setStatus] = useState({ username: 'Guest', appStatus: 'tokens.unknown', canGoLive: false, badge: 'common.check' })
  const [streamData, setStreamData] = useState({ url: '', key: '', id: null, isLive: false })
  const [statusLog, setStatusLog] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [modal, setModal] = useState({ show: false, title: '', body: '', buttons: [], resolve: null })
  
  const searchTimer = useRef(null)
  const searchCache = useRef(new Map())
  const latestSearch = useRef('')
  const autoSaveTimer = useRef(null)

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  const toggleLanguage = () => {
    const currentLang = i18n.language.split('-')[0]
    const newLang = currentLang === 'vi' ? 'en' : 'vi'
    i18n.changeLanguage(newLang)
  }

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.remove('light')
    }
  }, [theme])

  // Update primary color dynamically
  useEffect(() => {
    if (settings.themeColor !== '#31fb9a') {
      document.documentElement.style.setProperty('--primary', settings.themeColor)
    } else {
      document.documentElement.style.setProperty('--primary', '142.1 70.6% 45.3%')
    }
  }, [settings.themeColor])

  const pushStatus = useCallback((message, level = 'info') => {
    const entry = { 
      message, 
      level,
      time: new Date().toLocaleTimeString(), 
      timestamp: new Date().toISOString(),
      id: Date.now() 
    }
    setStatusLog(prev => [entry, ...prev].slice(0, 500))
  }, [])

  const pushToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const showModal = useCallback((title, body, buttons = [{ label: 'OK', value: true }]) => {
    return new Promise((resolve) => {
      setModal({ show: true, title, body, buttons, resolve })
    })
  }, [])

  const closeModal = useCallback((value) => {
    setModal(prev => {
      if (prev.resolve) prev.resolve({ value })
      return { ...prev, show: false, resolve: null }
    })
  }, [])

  // --- Core Logic ---

  const refreshAccountInfo = useCallback(async (manualToken, accountId) => {
    const targetToken = manualToken || token
    if (!targetToken) return
    pushStatus('Refreshing account data...', 'info')
    await window.api.setToken(targetToken)
    try {
      const res = await window.api.refreshAccount()
      if (res.ok) {
        const { user, application_status, can_be_live } = res.info || {}
        
        const statusMap = {
          'approved': 'common.approved',
          'pending': 'common.pending',
          'rejected': 'common.rejected',
          'not_applied': 'common.not_applied',
          'restricted': 'common.restricted_status',
          'forbidden': 'common.restricted_status'
        }
        
        const rawStatus = application_status?.status || 'Unknown'
        const appStatusKey = statusMap[rawStatus] || rawStatus

        setStatus({ 
          username: user?.username || t('tokens.unknown'), 
          appStatus: appStatusKey, 
          canGoLive: !!can_be_live, 
          badge: can_be_live ? 'common.ready' : 'common.check' 
        })
        pushStatus(`Account verified: ${user?.username}`, 'success')

        // Update account in database if needed
        if (accountId) {
          const acc = accounts.find(a => a.id === accountId)
          if (acc) {
            const updatedAcc = { ...acc, username: user?.username, lastUsed: Date.now() }
            await window.api.saveAccount(updatedAcc)
            const updatedList = await window.api.getAccounts()
            setAccounts(updatedList)
          }
        }

        if (gameCategory && !gameMaskId) {
          const searchRes = await window.api.searchGames(gameCategory)
          if (searchRes.ok) {
            const match = (searchRes.categories || []).find(c => c.full_name === gameCategory)
            if (match) setGameMaskId(match.game_mask_id || '')
          }
        }
        return true
      }
    } catch (err) {
      pushStatus(`Auth exception: ${err.message}`, 'error')
    }
    return false
  }, [token, gameCategory, gameMaskId, accounts, pushStatus, t])

  const loadLocalToken = async () => {
    const res = await window.api.loadLocalToken()
    if (res.token) { 
      setToken(res.token); 
      const newId = `local_${Date.now()}`
      const newAccount = { 
        id: newId, 
        name: `${t('tokens.local_fetch')} (${new Date().toLocaleDateString()})`, 
        type: 'local',
        token: res.token, 
        username: 'Checking...', 
        lastUsed: Date.now() 
      }
      await window.api.saveAccount(newAccount)
      const updatedList = await window.api.getAccounts()
      setAccounts(updatedList)
      setActiveAccountId(newId)
      refreshAccountInfo(res.token, newId); 
      pushStatus('Token imported from local storage.', 'success'); 
      pushToast('Local token loaded', 'success')
    }
    else if (res.error) { 
      pushStatus(`Local fetch failed: ${res.error}`, 'error');
      pushToast(res.error, 'error')
    }
  }

  const loadWebToken = async (existingAccountId = null) => {
    setIsWebLoading(true)
    pushStatus('Launching browser for web capture...', 'info')
    
    const res = await window.api.loadWebToken({ accountId: existingAccountId })
    setIsWebLoading(false)
    
    if (res.token) { 
      setToken(res.token); 
      let finalId = existingAccountId
      if (!existingAccountId) {
        finalId = `profile_${Date.now()}`
        const newAccount = { 
          id: finalId, 
          name: `${t('tokens.web_capture')} ${accounts.filter(a => a.type === 'web').length + 1}`, 
          type: 'web',
          token: res.token, 
          username: 'Authenticating...', 
          lastUsed: Date.now() 
        }
        await window.api.saveAccount(newAccount)
      } else {
        const acc = accounts.find(a => a.id === existingAccountId)
        await window.api.saveAccount({ ...acc, token: res.token, lastUsed: Date.now() })
      }
      
      const updatedList = await window.api.getAccounts()
      setAccounts(updatedList)
      setActiveAccountId(finalId)
      refreshAccountInfo(res.token, finalId); 
      pushStatus('Token captured from web session.', 'success'); 
      pushToast('Authentication successful', 'success')
    }
    else if (res.error) { 
      pushStatus(`Web capture failed: ${res.error}`, 'error');
      pushToast(res.error, 'error')
    }
  }

  const deleteAccount = async (accountId) => {
    const confirmed = await showModal('Delete Account', 'Are you sure you want to remove this account and its Chrome profile?', [
      { label: t('common.cancel'), value: 'cancel', primary: false },
      { label: 'Delete', value: 'delete', primary: true }
    ])
    
    if (confirmed.value === 'delete') {
      await window.api.deleteProfile(accountId)
      await window.api.deleteAccount(accountId)
      const updatedList = await window.api.getAccounts()
      setAccounts(updatedList)
      if (activeAccountId === accountId) {
        setToken('')
        setActiveAccountId(null)
        setStatus({ username: 'Guest', appStatus: 'tokens.unknown', canGoLive: false, badge: 'common.check' })
      }
      pushStatus(`Account removed.`, 'warn')
      pushToast('Account removed', 'info')
    }
  }

  const selectAccount = (accountId) => {
    const acc = accounts.find(a => a.id === accountId)
    if (acc) {
      setActiveAccountId(accountId)
      setToken(acc.token)
      refreshAccountInfo(acc.token, accountId)
      pushStatus(`Switched to account: ${acc.name}`, 'info')
      pushToast(`Switched to ${acc.username || acc.name}`, 'success')
    }
  }

  const saveConfig = useCallback(async (showMessage = false) => {
    await window.api.saveConfig({ 
      title: streamTitle, 
      game: gameCategory, 
      audience_type: mature ? '1' : '0', 
      token, 
      stream_id: streamData.id, 
      theme, 
      language: i18n.language,
      activeAccountId,
      settings
    })
    pushStatus('Configuration synchronized to disk.', 'info')
    if (showMessage) pushToast(t('common.save_success'), 'success')
  }, [streamTitle, gameCategory, mature, token, streamData.id, theme, i18n.language, activeAccountId, settings, pushStatus, pushToast, t])

  useEffect(() => {
    if (!token && !streamTitle && accounts.length === 0 && currentPage === 'home') return
    clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => { saveConfig(false) }, 1000)
    return () => clearTimeout(autoSaveTimer.current)
  }, [streamTitle, gameCategory, mature, token, theme, i18n.language, accounts, activeAccountId, settings, currentPage, saveConfig])

  const handleSearch = (text) => {
    setGameCategory(text)
    if (!text || !token) { setSuggestions([]); return; }
    clearTimeout(searchTimer.current)
    latestSearch.current = text
    searchTimer.current = setTimeout(async () => {
      const cached = searchCache.current.get(text)
      if (cached && Date.now() - cached.ts < 60000) { setSuggestions(cached.data); setShowSuggestions(true); return; }
      const res = await window.api.searchGames(text)
      if (res.ok) {
        const categories = res.categories || []
        if (latestSearch.current !== text) return
        searchCache.current.set(text, { ts: Date.now(), data: categories })
        setSuggestions(categories)
        setShowSuggestions(true)
      }
    }, 250)
  }

  const startStream = async () => {
    if (!gameMaskId && gameCategory) {
      const searchRes = await window.api.searchGames(gameCategory)
      if (searchRes.ok) {
        const match = (searchRes.categories || []).find(c => c.full_name === gameCategory)
        if (match) setGameMaskId(match.game_mask_id || '')
      }
    }
    pushStatus('Requesting TikTok LIVE stream endpoints...', 'info')
    const res = await window.api.startStream({ title: streamTitle, category: gameMaskId, audienceType: mature ? '1' : '0' })
    if (res.ok) {
      const { streamUrl, streamKey, streamId } = res.result || {}
      setStreamData({ url: streamUrl, key: streamKey, id: streamId || streamData.id, isLive: true })
      pushStatus('TikTok LIVE session started successfully.', 'success')
      pushToast('Broadcast is now ONLINE', 'success')
    } else {
      pushStatus(`Failed to start stream: ${res.error}`, 'error')
      pushToast(res.error, 'error')
    }
  }

  const endStream = async () => {
    pushStatus('Ending TikTok LIVE session...', 'info')
    const res = await window.api.endStream()
    if (res.ok) {
      setStreamData({ url: '', key: '', id: null, isLive: false })
      pushStatus('TikTok LIVE session terminated.', 'info')
      pushToast('Broadcast ended', 'info')
    } else {
      pushStatus('Error while ending stream.', 'error')
      pushToast('Could not end session', 'error')
    }
  }

  // --- Lifecycle & Events ---

  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      setLoadProgress(5)
      setLoadingMessage(t('common.loading'))
      pushStatus('System kernel initialized.', 'info')
      
      const version = await window.api.getAppVersion()
      setLoadProgress(20)
      const defPath = await window.api.getDefaultPath()
      setLoadProgress(35)
      const allPaths = await window.api.getAllPaths()
      
      setAppVersion(version)
      setDefaultPath(defPath)
      setSystemPaths(allPaths)
      
      setLoadProgress(45)
      const data = await window.api.loadConfig()
      
      // Load accounts from SQLite
      const dbAccounts = await window.api.getAccounts()
      setAccounts(dbAccounts)

      if (data.settings) setSettings(data.settings)
      if (data.activeAccountId) setActiveAccountId(data.activeAccountId)
      if (data.lastPage) setCurrentPage(data.lastPage)
      if (data.theme) setTheme(data.theme)
      if (data.language) {
        i18n.changeLanguage(data.language)
      }

      setLoadProgress(60)
      const driverExists = await window.api.checkDriverExists()
      if (!driverExists) {
        setIsLoading(false) 
        const choice = await showModal(
          t('driver.missing_title'),
          t('driver.missing_desc'),
          [
            { label: t('common.cancel'), value: 'cancel', primary: false },
            { label: t('driver.download_now'), value: 'download', primary: true }
          ]
        )

        if (choice.value === 'download') {
          setIsLoading(true)
          setLoadProgress(65)
          setLoadingMessage(t('driver.preparing'))
          await window.api.bootstrapDriver()
          setLoadProgress(85)
        }
      } else {
        setLoadProgress(85)
      }

      if (data.token) { 
        setToken(data.token); 
        await refreshAccountInfo(data.token, data.activeAccountId); 
      }
      
      setLoadProgress(100)
      window.api.rendererReady()
      setTimeout(() => setIsLoading(false), 800)
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) 

  // --- IPC Subscriptions ---
  useEffect(() => {
    const cleanupUpdate = window.api.onUpdateAvailable((info) => {
      pushStatus(`New version detected: ${info.latest}`, 'warn')
      showModal(t('update.available'), `${t('update.desc')} (${info.latest}). ${t('update.current')}: ${info.current}. ${t('update.ask')}`, [
        { label: t('update.now'), value: 'download', primary: true },
        { label: t('update.later'), value: 'cancel', primary: false }
      ]).then(res => {
        if (res.value === 'download') {
          pushStatus('Downloading update package...', 'info')
          window.api.startDownload()
          pushToast('Downloading update...', 'info')
        }
      })
    })

    const cleanupDownloaded = window.api.onUpdateDownloaded(() => {
      pushStatus('Update package ready for installation.', 'success')
      showModal(t('update.ready'), t('update.ready_desc'), [
        { label: t('update.restart'), value: 'install', primary: true },
        { label: t('update.later'), value: 'cancel', primary: false }
      ]).then(res => {
        if (res.value === 'install') window.api.quitAndInstall()
      })
    })

    const cleanupError = window.api.onUpdateError((err) => {
      pushStatus(`Update manager error: ${err}`, 'error')
      pushToast('Update failed', 'error')
    })

    const cleanupToken = window.api.onTokenStatus((msg) => {
      setLoadingMessage(msg)
      pushStatus(`Web Engine: ${msg}`, 'info')
    })

    return () => {
      cleanupUpdate()
      cleanupDownloaded()
      cleanupError()
      cleanupToken()
    }
  }, [pushStatus, showModal, pushToast, t])

  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden font-['Manrope']">
      <AnimatePresence>
        {isLoading && <LoadingOverlay message={loadingMessage} progress={loadProgress} />}
      </AnimatePresence>

      <ToastContainer>
        {toasts.map(toast => (
          <Toast 
            key={toast.id} 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} 
          />
        ))}
      </ToastContainer>

      <Sidebar 
        currentPage={currentPage} setCurrentPage={setCurrentPage} 
        username={status.username} canGoLive={status.canGoLive} 
        version={appVersion} theme={theme} toggleTheme={toggleTheme}
        language={i18n.language} toggleLanguage={toggleLanguage}
        isLoading={isLoading}
      />
      
      <main className="flex-1 flex flex-col min-w-0 relative bg-[radial-gradient(circle_at_top_right,rgba(49,251,154,0.03),transparent_40%)]">
        <Titlebar />
        
        <PageContainer>
          <AnimatePresence mode="wait">
            {currentPage === 'home' && (
              <Dashboard key="home" status={status} streamData={streamData} onNavigate={setCurrentPage} version={appVersion} isLoading={isLoading} />
            )}
            {currentPage === 'console' && (
              <Console 
                key="console"
                streamData={streamData} startStream={startStream} endStream={endStream} 
                canGoLive={status.canGoLive} streamTitle={streamTitle} gameCategory={gameCategory}
                pushToast={pushToast}
              />
            )}
            {currentPage === 'setup' && (
              <LiveSetup 
                key="setup"
                streamTitle={streamTitle} setStreamTitle={setStreamTitle}
                gameCategory={gameCategory} handleSearch={handleSearch}
                suggestions={suggestions} showSuggestions={showSuggestions} setShowSuggestions={setShowSuggestions}
                setGameCategory={setGameCategory} setGameMaskId={setGameMaskId}
                mature={mature} setMature={setMature}
                saveConfig={saveConfig}
              />
            )}
            {currentPage === 'tokens' && (
              <TokenVault 
                key="tokens"
                token={token} showToken={showToken} setShowToken={setShowToken}
                loadLocalToken={loadLocalToken} loadWebToken={loadWebToken} isWebLoading={isWebLoading}
                refreshAccountInfo={refreshAccountInfo} saveConfig={saveConfig}
                canGoLive={status.canGoLive} status={status}
                accounts={accounts} selectAccount={selectAccount} deleteAccount={deleteAccount} activeAccountId={activeAccountId}
                isLoading={isLoading}
              />
            )}
            {currentPage === 'status' && (
              <Pulse key="status" statusLog={statusLog} setStatusLog={setStatusLog} />
            )}
            {currentPage === 'settings' && (
              <Settings 
                key="settings" 
                settings={settings} 
                setSettings={setSettings} 
                saveConfig={saveConfig} 
                defaultPath={defaultPath} 
                systemPaths={systemPaths}
                version={appVersion}
                showModal={showModal}
              />
            )}
          </AnimatePresence>
        </PageContainer>

        <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full -mr-96 -mt-96 pointer-events-none z-[-1]" />
        <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full -ml-64 -mb-64 pointer-events-none z-[-1]" />
      </main>

      <AnimatePresence>
        {modal.show && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-center justify-center p-8 backdrop-blur-md bg-black/60">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="glass border border-white/10 w-full max-w-lg rounded-[40px] p-12 space-y-8 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="space-y-4">
                <h2 className="text-3xl font-black tracking-tight">{modal.title}</h2>
                <p className="text-zinc-400 text-lg leading-relaxed font-medium">{modal.body}</p>
              </div>
              <div className="flex justify-end gap-4">
                {modal.buttons.map((btn, i) => (
                  <Button key={i} variant={btn.primary !== false ? 'primary' : 'secondary'} onClick={() => closeModal(btn.value)} className="px-8 py-4">
                    {btn.label}
                  </Button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App