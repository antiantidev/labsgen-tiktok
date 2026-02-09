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
  const [isDriverMissing, setIsDriverMissing] = useState(false)
  
  const [currentPage, setCurrentPage] = useState('home')
  const [theme, setTheme] = useState('dark')
  const [appVersion, setAppVersion] = useState('0.0.0')
  const [defaultPath, setDefaultPath] = useState('')
  const [systemPaths, setSystemPaths] = useState({})
  
  const [settings, setSettings] = useState({
    customProfilePath: '',
    autoRefresh: true,
    minimizeOnClose: false,
    captureDelay: 5000
  })

  const [accounts, setAccounts] = useState([])
  const [activeAccountId, setActiveAccountId] = useState(null)
  const [token, setToken] = useState('')
  
  const [streamTitle, setStreamTitle] = useState('')
  const [gameCategory, setGameCategory] = useState('')
  const [gameMaskId, setGameMaskId] = useState('')
  const [mature, setMature] = useState(false)
  const [isWebLoading, setIsWebLoading] = useState(false)
  const [status, setStatus] = useState({ username: 'Guest', appStatus: 'tokens.unknown', canGoLive: false, badge: 'common.check' })
  const [streamData, setStreamData] = useState({ url: '', key: '', id: null, isLive: false })
  const [statusLog, setStatusLog] = useState([])
  const [logPage, setLogPage] = useState(1)
  const [logPageSize] = useState(50)
  const [logTotal, setLogTotal] = useState(0)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [modal, setModal] = useState({ show: false, title: '', body: '', buttons: [], resolve: null })
  
  const searchTimer = useRef(null)
  const searchCache = useRef(new Map())
  const latestSearch = useRef('')
  const autoSaveTimer = useRef(null)

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  const toggleLanguage = () => i18n.changeLanguage(i18n.language.startsWith('vi') ? 'en' : 'vi')

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  const pushStatus = useCallback((message, level = 'info') => {
    if (window.api && window.api.addSystemLog) {
      window.api.addSystemLog({ level, message });
    }
  }, [])

  const loadLogs = useCallback(async (page = 1) => {
    const offset = (page - 1) * logPageSize
    const logs = await window.api.getSystemLogs({ limit: logPageSize, offset })
    const total = await window.api.getSystemLogCount()
    setLogTotal(total || 0)
    setLogPage(page)
    setStatusLog((logs || []).map(l => ({
      id: l.id,
      level: l.level,
      message: l.message,
      timestamp: l.timestamp,
      time: new Date(l.timestamp).toLocaleTimeString()
    })))
  }, [logPageSize])

  const clearLogs = useCallback(async () => {
    await window.api.clearSystemLogs()
    setStatusLog([])
    setLogTotal(0)
    setLogPage(1)
  }, [])

  const pushToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  const showModal = useCallback((title, body, buttons = [{ label: 'OK', value: true }]) => {
    return new Promise((resolve) => setModal({ show: true, title, body, buttons, resolve }))
  }, [])

  const closeModal = useCallback((value) => {
    setModal(prev => { if (prev.resolve) prev.resolve({ value }); return { ...prev, show: false, resolve: null } })
  }, [])

  const refreshAccountInfo = useCallback(async (manualToken, accountId) => {
    const targetToken = manualToken || token
    if (!targetToken) return false
    pushStatus('Refreshing account data...', 'info')
    await window.api.setToken(targetToken)
    try {
      const res = await window.api.refreshAccount()
      if (res.ok) {
        const { user, application_status, can_be_live } = res.info || {}
        const statusMap = { 'approved': 'common.approved', 'pending': 'common.pending', 'rejected': 'common.rejected', 'not_applied': 'common.not_applied', 'restricted': 'common.restricted_status', 'forbidden': 'common.restricted_status' }
        let appStatusKey = statusMap[application_status?.status] || application_status?.status
        if (!appStatusKey || !i18n.exists(appStatusKey)) appStatusKey = 'tokens.unknown'

        setStatus({ username: user?.username || t('tokens.unknown'), appStatus: appStatusKey, canGoLive: !!can_be_live, badge: can_be_live ? 'common.ready' : 'common.check' })
        if (accountId && user?.username) {
          await window.api.updateUsername(accountId, user.username)
          const updatedList = await window.api.getAccounts()
          setAccounts(updatedList)
        }
        return true
      }
    } catch (err) { pushStatus(`Auth exception: ${err.message}`, 'error') }
    return false
  }, [token, pushStatus, t])

  const saveConfig = useCallback(async (showMessage = false) => {
    let finalCategory = gameCategory; let finalMaskId = gameMaskId;
    if (gameCategory && !gameMaskId) {
      const match = await window.api.getCategoryByName(gameCategory);
      if (match) { finalCategory = match.full_name; finalMaskId = match.game_mask_id; setGameCategory(finalCategory); setGameMaskId(finalMaskId); }
      else if (showMessage) { pushToast(t('setup.invalid_category'), 'error'); return false; }
    }
    const appState = { title: streamTitle, game: finalCategory, audience_type: mature ? '1' : '0', token, stream_id: streamData.id, theme, language: i18n.language, activeAccountId, settings, lastPage: currentPage, game_mask_id: finalMaskId }
    await window.api.saveSetting('app_state', appState)
    if (showMessage) pushToast(t('common.save_success'), 'success')
    return true
  }, [streamTitle, gameCategory, gameMaskId, mature, token, streamData.id, theme, i18n.language, activeAccountId, settings, currentPage, pushToast, t])

  // Immediate save for page changes
  useEffect(() => {
    if (!isLoading) saveConfig(false)
  }, [currentPage])

  useEffect(() => {
    if (!isLoading) { 
      clearTimeout(autoSaveTimer.current)
      autoSaveTimer.current = setTimeout(() => saveConfig(false), 800)
    }
    return () => clearTimeout(autoSaveTimer.current)
  }, [streamTitle, gameCategory, mature, token, theme, i18n.language, activeAccountId, settings, isLoading, saveConfig])

  const loadLocalToken = async () => {
    pushStatus('Local token extraction started', 'info')
    const res = await window.api.loadLocalToken()
    if (res.token) { 
      setToken(res.token); const newId = `local_${Date.now()}`
      const newAccount = { id: newId, name: `${t('tokens.local_fetch')} (${new Date().toLocaleDateString()})`, type: 'local', token: res.token, username: 'Checking...', lastUsed: Date.now() }
      await window.api.saveAccount(newAccount); const updatedList = await window.api.getAccounts(); setAccounts(updatedList); setActiveAccountId(newId); await refreshAccountInfo(res.token, newId); 
      pushToast('Local token loaded', 'success')
      pushStatus('Local token loaded', 'success')
    } else if (res.error) {
      pushToast(res.error, 'error')
      pushStatus(`Local token error: ${res.error}`, 'error')
    }
  }

  const loadWebToken = async (existingAccountId = null) => {
    pushStatus('Web token capture started', 'info')
    const driverExists = await window.api.checkDriverExists()
    if (!driverExists) {
      const choice = await showModal(t('driver.missing_title'), t('driver.missing_desc'), [{ label: t('common.cancel'), value: 'cancel', primary: false }, { label: t('driver.download_now'), value: 'download', primary: true }])
      if (choice.value === 'download') {
        setIsLoading(true); setLoadingMessage(t('driver.preparing'))
        const res = await window.api.bootstrapDriver(); if (res.ok) setIsDriverMissing(false); setIsLoading(false)
      } else { setIsDriverMissing(true); return }
    }
    setIsWebLoading(true); const res = await window.api.loadWebToken({ accountId: existingAccountId }); setIsWebLoading(false)
    if (res.token) { 
      setToken(res.token); let finalId = existingAccountId
      if (!existingAccountId) {
        finalId = `profile_${Date.now()}`; const newAccount = { id: finalId, name: `${t('tokens.web_capture')} ${accounts.filter(a => a.type === 'web').length + 1}`, type: 'web', token: res.token, username: 'Authenticating...', lastUsed: Date.now() }
        await window.api.saveAccount(newAccount)
      } else {
        const currentAccounts = await window.api.getAccounts(); const acc = currentAccounts.find(a => a.id === existingAccountId)
        await window.api.saveAccount({ ...acc, token: res.token, lastUsed: Date.now() })
      }
      const updatedList = await window.api.getAccounts(); setAccounts(updatedList); setActiveAccountId(finalId); await refreshAccountInfo(res.token, finalId); 
      pushToast('Authentication successful', 'success')
      pushStatus('Web token captured', 'success')
    } else if (res.error) {
      pushToast(res.error, 'error')
      pushStatus(`Web token error: ${res.error}`, 'error')
    }
  }

  const deleteAccount = async (accountId) => {
    const confirmed = await showModal('Delete Account', 'Are you sure?', [{ label: t('common.cancel'), value: 'cancel', primary: false }, { label: 'Delete', value: 'delete', primary: true }])
    if (confirmed.value === 'delete') {
      await window.api.deleteProfile(accountId); await window.api.deleteAccount(accountId); const updatedList = await window.api.getAccounts(); setAccounts(updatedList)
      if (activeAccountId === accountId) { setToken(''); setActiveAccountId(null); setStatus({ username: 'Guest', appStatus: 'tokens.unknown', canGoLive: false, badge: 'common.check' }) }
      pushToast('Account removed', 'info')
      pushStatus(`Account removed: ${accountId}`, 'info')
    }
  }

  const selectAccount = (accountId) => {
    const acc = accounts.find(a => a.id === accountId)
    if (acc) { setActiveAccountId(accountId); setToken(acc.token); refreshAccountInfo(acc.token, accountId); pushToast(`Switched to ${acc.username || acc.name}`, 'success'); pushStatus(`Switched account: ${acc.username || acc.name}`, 'info') }
  }

  const handleSearch = (text) => {
    setGameCategory(text); setGameMaskId('') 
    if (!text || !token) { setSuggestions([]); return; }
    clearTimeout(searchTimer.current); latestSearch.current = text
    searchTimer.current = setTimeout(async () => {
      const res = await window.api.searchGames(text)
      if (res.ok && latestSearch.current === text) { setSuggestions(res.categories || []); setShowSuggestions(true) }
    }, 250)
  }

  const startStream = async () => {
    let finalMaskId = gameMaskId; if (!finalMaskId && gameCategory) { const match = await window.api.getCategoryByName(gameCategory); if (match) finalMaskId = match.game_mask_id; }
    if (!finalMaskId) { pushToast(t('setup.invalid_category'), 'error'); return; }
    const res = await window.api.startStream({ title: streamTitle, category: finalMaskId, audienceType: mature ? '1' : '0' })
    if (res.ok) {
      const { streamUrl, streamKey, streamId } = res.result || {}
      setStreamData({ url: streamUrl, key: streamKey, id: streamId || streamData.id, isLive: true }); pushToast('Broadcast is now ONLINE', 'success')
    } else pushToast(res.error, 'error')
  }

  const endStream = async () => {
    const res = await window.api.endStream()
    if (res.ok) { setStreamData({ url: '', key: '', id: null, isLive: false }); pushToast('Broadcast ended', 'info') }
    else pushToast('Could not end session', 'error')
  }

  useEffect(() => {
    const init = async () => {
      setIsLoading(true); setLoadProgress(5); setLoadingMessage(t('common.loading'))
      const version = await window.api.getAppVersion(); const defPath = await window.api.getDefaultPath(); const allPaths = await window.api.getAllPaths()
      setAppVersion(version); setDefaultPath(defPath); setSystemPaths(allPaths)
      setLoadProgress(30); setLoadingMessage('Accessing local database...')
      let data = await window.api.getSetting('app_state')
      await loadLogs(1)
      const dbAccounts = await window.api.getAccounts(); setAccounts(dbAccounts)
      if (data) {
        if (data.settings) setSettings(data.settings)
        if (data.activeAccountId) setActiveAccountId(data.activeAccountId)
        if (data.lastPage) setCurrentPage(data.lastPage)
        if (data.theme) setTheme(data.theme)
        if (data.language) i18n.changeLanguage(data.language)
        if (data.title) setStreamTitle(data.title)
        if (data.game) setGameCategory(data.game)
        if (data.game_mask_id) setGameMaskId(data.game_mask_id)
        if (data.audience_type) setMature(data.audience_type === '1')
        if (data.token) setToken(data.token)
      }
      setLoadProgress(60); setLoadingMessage('Verifying system dependencies...')
      if (!(await window.api.checkDriverExists())) {
        setIsDriverMissing(true); setIsLoading(false) 
        const choice = await showModal(t('driver.missing_title'), t('driver.missing_desc'), [{ label: t('common.cancel'), value: 'cancel', primary: false }, { label: t('driver.download_now'), value: 'download', primary: true }])
        if (choice.value === 'download') {
          setIsLoading(true); setLoadingMessage(t('driver.preparing'))
          const res = await window.api.bootstrapDriver(); if (res.ok) setIsDriverMissing(false); setLoadProgress(85)
        }
      } else { setIsDriverMissing(false); setLoadProgress(85) }
      if (data?.settings?.autoRefresh && (token || data?.token)) {
        setLoadingMessage('Synchronizing account status...')
        await refreshAccountInfo(token || data.token, activeAccountId || data.activeAccountId); 
      }
      setLoadProgress(100); setLoadingMessage('Kernel ready.'); window.api.rendererReady(); setTimeout(() => setIsLoading(false), 800)
    }
    init()
  }, []) 

  useEffect(() => {
    const cu = window.api.onUpdateAvailable((i) => showModal(t('update.available'), `${t('update.desc')} (${i.latest}).`, [{ label: t('update.now'), value: 'download', primary: true }, { label: t('update.later'), value: 'cancel', primary: false }]).then(r => { if (r.value === 'download') window.api.startDownload(); }))
    const cd = window.api.onUpdateDownloaded(() => showModal(t('update.ready'), t('update.ready_desc'), [{ label: t('update.restart'), value: 'install', primary: true }, { label: t('update.later'), value: 'cancel', primary: false }]).then(r => { if (r.value === 'install') window.api.quitAndInstall() }))
    const ce = window.api.onUpdateError(() => pushToast('Update failed', 'error'))
    const ct = window.api.onTokenStatus((m) => { setLoadingMessage(m); pushStatus(`Web: ${m}`, 'info'); })
    const cl = window.api.onSystemLog((entry) => {
      if (!entry) return;
      setLogTotal(prev => prev + 1)
      if (logPage === 1) {
        setStatusLog(prev => [{
          id: entry.id || Date.now(),
          level: entry.level || 'info',
          message: entry.message || '',
          timestamp: entry.timestamp || new Date().toISOString(),
          time: new Date(entry.timestamp || Date.now()).toLocaleTimeString()
        }, ...prev].slice(0, logPageSize))
      }
    })
    return () => { cu(); cd(); ce(); ct(); cl(); }
  }, [pushStatus, showModal, pushToast, t, logPage, logPageSize])

  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden font-['Plus_Jakarta_Sans']">
      <AnimatePresence>{isLoading && <LoadingOverlay message={loadingMessage} progress={loadProgress} />}</AnimatePresence>
      <ToastContainer>{toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} onClose={() => setToasts(prev => prev.filter(toast => toast.id !== t.id))} />)}</ToastContainer>
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} username={status.username} canGoLive={status.canGoLive} version={appVersion} isLoading={isLoading} />
      <main className="flex-1 flex flex-col min-w-0 relative bg-[radial-gradient(circle_at_top_right,rgba(49,251,154,0.03),transparent_40%)]">
        <Titlebar />
        <PageContainer>
          <AnimatePresence mode="wait">
            {currentPage === 'home' && <Dashboard status={status} streamData={streamData} onNavigate={setCurrentPage} isLoading={isLoading} />}
            {currentPage === 'console' && <Console streamData={streamData} startStream={startStream} endStream={endStream} canGoLive={status.canGoLive} streamTitle={streamTitle} gameCategory={gameCategory} pushToast={pushToast} />}
            {currentPage === 'setup' && <LiveSetup streamTitle={streamTitle} setStreamTitle={setStreamTitle} gameCategory={gameCategory} handleSearch={handleSearch} suggestions={suggestions} showSuggestions={showSuggestions} setShowSuggestions={setShowSuggestions} setGameCategory={setGameCategory} setGameMaskId={setGameMaskId} mature={mature} setMature={setMature} saveConfig={saveConfig} gameMaskId={gameMaskId} pushToast={pushToast} />}
            {currentPage === 'tokens' && <TokenVault isDriverMissing={isDriverMissing} loadLocalToken={loadLocalToken} loadWebToken={loadWebToken} isWebLoading={isWebLoading} refreshAccountInfo={refreshAccountInfo} canGoLive={status.canGoLive} status={status} accounts={accounts} selectAccount={selectAccount} deleteAccount={deleteAccount} activeAccountId={activeAccountId} isLoading={isLoading} setCurrentPage={setCurrentPage} />}
            {currentPage === 'status' && (
              <Pulse
                statusLog={statusLog}
                setStatusLog={setStatusLog}
                logPage={logPage}
                logPageSize={logPageSize}
                logTotal={logTotal}
                loadLogs={loadLogs}
                clearLogs={clearLogs}
              />
            )}
            {currentPage === 'settings' && <Settings isDriverMissing={isDriverMissing} setIsDriverMissing={setIsDriverMissing} settings={settings} setSettings={setSettings} saveConfig={saveConfig} defaultPath={defaultPath} systemPaths={systemPaths} version={appVersion} showModal={showModal} theme={theme} toggleTheme={toggleTheme} pushToast={pushToast} />}
          </AnimatePresence>
        </PageContainer>
        <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-primary/5 light:bg-primary/10 blur-[150px] rounded-full -mr-96 -mt-96 pointer-events-none z-[-1]" />
        <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-info/5 light:bg-info/10 blur-[120px] rounded-full -ml-64 -mb-64 pointer-events-none z-[-1]" />
      </main>
      <AnimatePresence>
        {modal.show && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-0 z-[300] flex items-center justify-center p-8 backdrop-blur-md ${theme === 'light' ? 'bg-white/40' : 'bg-black/60'}`}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="glass border border-white/10 w-full max-w-lg rounded-xl p-12 space-y-8 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="space-y-4">
                <h2 className="text-3xl font-black tracking-tight">{modal.title}</h2>
                <p className="text-muted-foreground text-[14px] font-medium leading-relaxed">{modal.body}</p>
              </div>
              <div className="flex justify-end gap-4">{modal.buttons.map((btn, i) => <Button key={i} variant={btn.primary !== false ? 'primary' : 'secondary'} onClick={() => closeModal(btn.value)} className="px-8 py-4">{btn.label}</Button>)}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
