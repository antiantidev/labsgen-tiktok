import React, { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

// Layout & UI
import { Sidebar } from './components/layout/Sidebar'
import { Titlebar, PageContainer } from './components/layout'
import { Button } from './components/ui'

// Pages
import Dashboard from './pages/Dashboard'
import Console from './pages/Console'
import LiveSetup from './pages/LiveSetup'
import TokenVault from './pages/TokenVault'
import Pulse from './pages/Pulse'
import Settings from './pages/Settings'

const App = () => {
  const { t, i18n } = useTranslation()
  const [currentPage, setCurrentPage] = useState('home')
  const [theme, setTheme] = useState('dark')
  const [appVersion, setAppVersion] = useState('0.0.0')
  const [defaultPath, setDefaultPath] = useState('')
  
  // Settings State
  const [settings, setSettings] = useState({
    customProfilePath: '',
    autoRefresh: true,
    captureDelay: 5000,
    themeColor: '#31fb9a'
  })

  // Account Management State
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

  const pushStatus = useCallback((message) => {
    const entry = { message, time: new Date().toLocaleTimeString(), id: Date.now() }
    setStatusLog(prev => [entry, ...prev].slice(0, 50))
  }, [])

  const showModal = useCallback((title, body, buttons = [{ label: 'OK', value: true }]) => {
    return new Promise((resolve) => {
      setModal({ show: true, title, body, buttons, resolve })
    })
  }, [])

  const closeModal = (value) => {
    if (modal.resolve) modal.resolve({ value })
    setModal(prev => ({ ...prev, show: false, resolve: null }))
  }

  // --- Core Logic ---

  const refreshAccountInfo = useCallback(async (manualToken, accountId) => {
    const targetToken = manualToken || token
    if (!targetToken) return
    pushStatus('Refreshing account data...')
    await window.api.setToken(targetToken)
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
      pushStatus(`Account verified: ${user?.username}`)

      if (accountId) {
        setAccounts(prev => prev.map(acc => 
          acc.id === accountId ? { ...acc, username: user?.username, lastUsed: Date.now() } : acc
        ))
      }

      if (gameCategory && !gameMaskId) {
        const searchRes = await window.api.searchGames(gameCategory)
        if (searchRes.ok) {
          const match = (searchRes.categories || []).find(c => c.full_name === gameCategory)
          if (match) setGameMaskId(match.game_mask_id || '')
        }
      }
    } else {
      pushStatus(`Auth error: ${res.error}`)
    }
  }, [token, gameCategory, gameMaskId, pushStatus, t])

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
      setAccounts(prev => [...prev, newAccount])
      setActiveAccountId(newId)
      refreshAccountInfo(res.token, newId); 
      pushStatus('Token imported from local storage.'); 
    }
    else if (res.error) { await showModal(t('common.error'), res.error); }
  }

  const loadWebToken = async (existingAccountId = null) => {
    setIsWebLoading(true)
    pushStatus('Waiting for web authentication...')
    
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
        setAccounts(prev => [...prev, newAccount])
      } else {
        setAccounts(prev => prev.map(acc => acc.id === existingAccountId ? { ...acc, token: res.token, lastUsed: Date.now() } : acc))
      }
      
      setActiveAccountId(finalId)
      refreshAccountInfo(res.token, finalId); 
      pushStatus('Token captured from web session.'); 
    }
    else if (res.error) { await showModal(t('common.error'), res.error); }
  }

  const deleteAccount = async (accountId) => {
    const confirmed = await showModal('Delete Account', 'Are you sure you want to remove this account and its Chrome profile?', [
      { label: t('common.cancel'), value: 'cancel', primary: false },
      { label: 'Delete', value: 'delete', primary: true }
    ])
    
    if (confirmed.value === 'delete') {
      await window.api.deleteProfile(accountId)
      setAccounts(prev => prev.filter(acc => acc.id !== accountId))
      if (activeAccountId === accountId) {
        setToken('')
        setActiveAccountId(null)
        setStatus({ username: 'Guest', appStatus: 'tokens.unknown', canGoLive: false, badge: 'common.check' })
      }
      pushStatus('Account removed.')
    }
  }

  const selectAccount = (accountId) => {
    const acc = accounts.find(a => a.id === accountId)
    if (acc) {
      setActiveAccountId(accountId)
      setToken(acc.token)
      refreshAccountInfo(acc.token, accountId)
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
      accounts,
      activeAccountId,
      settings
    })
    if (showMessage) await showModal(t('common.success'), t('common.save_success'))
    pushStatus('System configuration synchronized.')
  }, [streamTitle, gameCategory, mature, token, streamData.id, theme, i18n.language, accounts, activeAccountId, settings, pushStatus, showModal, t])

  useEffect(() => {
    if (!token && !streamTitle && accounts.length === 0) return
    clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => { saveConfig(false) }, 1000)
    return () => clearTimeout(autoSaveTimer.current)
  }, [streamTitle, gameCategory, mature, token, theme, i18n.language, accounts, activeAccountId, settings, saveConfig])

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
    pushStatus('Starting TikTok LIVE session...')
    const res = await window.api.startStream({ title: streamTitle, category: gameMaskId, audienceType: mature ? '1' : '0' })
    if (res.ok) {
      const { streamUrl, streamKey, streamId } = res.result || {}
      setStreamData({ url: streamUrl, key: streamKey, id: streamId || streamData.id, isLive: true })
      pushStatus('Stream is now ON AIR.')
      await showModal(t('console.live_started'), t('console.live_started_desc'))
    } else {
      pushStatus(`Failed to start: ${res.error}`)
      await showModal(t('common.error'), res.error)
    }
  }

  const endStream = async () => {
    pushStatus('Ending session...')
    const res = await window.api.endStream()
    if (res.ok) {
      setStreamData({ url: '', key: '', id: null, isLive: false })
      pushStatus('Stream session terminated.')
      await showModal(t('console.live_ended'), t('console.live_ended_desc'))
    } else {
      await showModal(t('common.error'), t('console.end_error'))
    }
  }

  // --- Lifecycle & Events ---

  useEffect(() => {
    const init = async () => {
      pushStatus('Initializing system...')
      const version = await window.api.getAppVersion()
      const defPath = await window.api.getDefaultPath()
      setAppVersion(version)
      setDefaultPath(defPath)
      
      const data = await window.api.loadConfig()
      
      if (data.settings) setSettings(data.settings)
      if (data.accounts) setAccounts(data.accounts)
      if (data.activeAccountId) setActiveAccountId(data.activeAccountId)

      if (data.token) { setToken(data.token); setTimeout(() => refreshAccountInfo(data.token, data.activeAccountId), 100); }
      setStreamTitle(data.title || ''); setGameCategory(data.game || ''); setMature(data.audience_type === '1');
      if (data.stream_id) setStreamData(prev => ({ ...prev, id: data.stream_id }))
      if (data.theme) setTheme(data.theme)
      if (data.language) {
        i18n.changeLanguage(data.language)
      }
      window.api.rendererReady()
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) 

  // --- IPC Subscriptions ---
  useEffect(() => {
    const cleanupUpdate = window.api.onUpdateAvailable((info) => {
      pushStatus(`Update found: ${info.latest}`)
      showModal(t('update.available'), `${t('update.desc')} (${info.latest}). ${t('update.current')}: ${info.current}. ${t('update.ask')}`, [
        { label: t('update.now'), value: 'download', primary: true },
        { label: t('update.later'), value: 'cancel', primary: false }
      ]).then(res => {
        if (res.value === 'download') {
          pushStatus('Downloading update...')
          window.api.startDownload()
          showModal(t('update.downloading'), t('update.downloading_desc'), [{ label: t('common.ok'), value: true }])
        }
      })
    })

    const cleanupDownloaded = window.api.onUpdateDownloaded(() => {
      pushStatus('Update ready to install.')
      showModal(t('update.ready'), t('update.ready_desc'), [
        { label: t('update.restart'), value: 'install', primary: true },
        { label: t('update.later'), value: 'cancel', primary: false }
      ]).then(res => {
        if (res.value === 'install') window.api.quitAndInstall()
      })
    })

    const cleanupError = window.api.onUpdateError((err) => {
      pushStatus(`Update error: ${err}`)
    })

    const cleanupToken = window.api.onTokenStatus((msg) => {
      pushStatus(`System: ${msg}`)
    })

    return () => {
      cleanupUpdate()
      cleanupDownloaded()
      cleanupError()
      cleanupToken()
    }
  }, [pushStatus, showModal, t])

  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden font-['Manrope']">
      <Sidebar 
        currentPage={currentPage} setCurrentPage={setCurrentPage} 
        username={status.username} canGoLive={status.canGoLive} 
        version={appVersion} theme={theme} toggleTheme={toggleTheme}
        language={i18n.language} toggleLanguage={toggleLanguage}
      />
      
      <main className="flex-1 flex flex-col min-w-0 relative bg-[radial-gradient(circle_at_top_right,rgba(49,251,154,0.03),transparent_40%)]">
        <Titlebar />
        
        <PageContainer>
          <AnimatePresence mode="wait">
            {currentPage === 'home' && (
              <Dashboard key="home" status={status} streamData={streamData} onNavigate={setCurrentPage} version={appVersion} />
            )}
            {currentPage === 'console' && (
              <Console 
                key="console"
                streamData={streamData} startStream={startStream} endStream={endStream} 
                canGoLive={status.canGoLive} streamTitle={streamTitle} gameCategory={gameCategory}
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
              />
            )}
            {currentPage === 'status' && (
              <Pulse key="status" statusLog={statusLog} setStatusLog={setStatusLog} />
            )}
            {currentPage === 'settings' && (
              <Settings key="settings" settings={settings} setSettings={setSettings} saveConfig={saveConfig} defaultPath={defaultPath} />
            )}
          </AnimatePresence>
        </PageContainer>

        <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full -mr-96 -mt-96 pointer-events-none z-[-1]" />
        <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full -ml-64 -mb-64 pointer-events-none z-[-1]" />
      </main>

      <AnimatePresence>
        {modal.show && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-8 backdrop-blur-md bg-black/60">
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