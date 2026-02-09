import React, { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

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

const App = () => {
  const [currentPage, setCurrentPage] = useState('home')
  const [token, setToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [streamTitle, setStreamTitle] = useState('')
  const [gameCategory, setGameCategory] = useState('')
  const [gameMaskId, setGameMaskId] = useState('')
  const [mature, setMature] = useState(false)
  const [isWebLoading, setIsWebLoading] = useState(false)
  const [status, setStatus] = useState({ username: 'Guest', appStatus: 'Offline', canGoLive: false, badge: 'Disconnected' })
  const [streamData, setStreamData] = useState({ url: '', key: '', id: null, isLive: false })
  const [statusLog, setStatusLog] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [modal, setModal] = useState({ show: false, title: '', body: '', buttons: [], resolve: null })
  
  const searchTimer = useRef(null)
  const searchCache = useRef(new Map())
  const latestSearch = useRef('')
  const autoSaveTimer = useRef(null)

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

  const refreshAccountInfo = useCallback(async (manualToken) => {
    const targetToken = manualToken || token
    if (!targetToken) return
    
    pushStatus('Refreshing account data...')
    await window.api.setToken(targetToken)
    const res = await window.api.refreshAccount()
    
    if (res.ok) {
      const { user, application_status, can_be_live } = res.info || {}
      setStatus({ 
        username: user?.username || 'Unknown', 
        appStatus: application_status?.status || 'Unknown', 
        canGoLive: !!can_be_live, 
        badge: can_be_live ? 'Ready' : 'Check' 
      })
      pushStatus(`Account verified: ${user?.username}`)
      
      // If we have a game category but no ID, try to find it
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
  }, [token, gameCategory, gameMaskId, pushStatus])

  const loadLocalToken = async () => {
    const res = await window.api.loadLocalToken()
    if (res.token) { 
      setToken(res.token)
      pushStatus('Token imported from local storage.')
      refreshAccountInfo(res.token) 
    } else if (res.error) {
      await showModal('Token Error', res.error)
    }
  }

  const loadWebToken = async () => {
    setIsWebLoading(true)
    pushStatus('Waiting for web authentication...')
    const res = await window.api.loadWebToken()
    setIsWebLoading(false)
    if (res.token) { 
      setToken(res.token)
      pushStatus('Token captured from web session.')
      refreshAccountInfo(res.token) 
    } else if (res.error) {
      await showModal('Login Failed', res.error)
    }
  }

  const saveConfig = useCallback(async (showMessage = false) => {
    await window.api.saveConfig({ 
      title: streamTitle, 
      game: gameCategory, 
      audience_type: mature ? '1' : '0', 
      token, 
      stream_id: streamData.id, 
      theme: 'dark' 
    })
    if (showMessage) await showModal('Success', 'Configuration saved safely.')
    pushStatus('System configuration synchronized.')
  }, [streamTitle, gameCategory, mature, token, streamData.id, pushStatus, showModal])

  // Debounced Auto-save
  useEffect(() => {
    if (!token && !streamTitle) return
    clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      saveConfig(false)
    }, 1000)
    return () => clearTimeout(autoSaveTimer.current)
  }, [streamTitle, gameCategory, mature, token, saveConfig])

  const handleSearch = (text) => {
    setGameCategory(text)
    if (!text || !token) { setSuggestions([]); return; }
    
    clearTimeout(searchTimer.current)
    latestSearch.current = text
    searchTimer.current = setTimeout(async () => {
      const cached = searchCache.current.get(text)
      if (cached && Date.now() - cached.ts < 60000) {
        setSuggestions(cached.data)
        setShowSuggestions(true)
        return
      }
      
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
      pushStatus('Fetching category ID before start...')
      const searchRes = await window.api.searchGames(gameCategory)
      if (searchRes.ok) {
        const match = (searchRes.categories || []).find(c => c.full_name === gameCategory)
        if (match) setGameMaskId(match.game_mask_id || '')
      }
    }

    pushStatus('Starting TikTok LIVE session...')
    const res = await window.api.startStream({ 
      title: streamTitle, 
      category: gameMaskId, 
      audienceType: mature ? '1' : '0' 
    })
    
    if (res.ok) {
      const { streamUrl, streamKey, streamId } = res.result || {}
      setStreamData({ url: streamUrl, key: streamKey, id: streamId || streamData.id, isLive: true })
      pushStatus('Stream is now ON AIR.')
      await showModal('Live Online', 'Your stream credentials have been generated.')
    } else {
      pushStatus(`Failed to start: ${res.error}`)
      await showModal('Broadcast Error', res.error)
    }
  }

  const endStream = async () => {
    pushStatus('Ending session...')
    const res = await window.api.endStream()
    if (res.ok) {
      setStreamData({ url: '', key: '', id: null, isLive: false })
      pushStatus('Stream session terminated.')
      await showModal('Offline', 'Stream has been ended successfully.')
    } else {
      await showModal('Error', 'Could not end the stream session.')
    }
  }

  // --- Lifecycle & Events ---

  useEffect(() => {
    const init = async () => {
      pushStatus('Initializing system...')
      const data = await window.api.loadConfig()
      if (data.token) { 
        setToken(data.token)
        // Manual refresh after setToken to ensure we use latest
        setTimeout(() => refreshAccountInfo(data.token), 100)
      }
      setStreamTitle(data.title || '')
      setGameCategory(data.game || '')
      setMature(data.audience_type === '1')
      
      if (data.stream_id) {
        setStreamData(prev => ({ ...prev, id: data.stream_id }))
      }

      window.api.rendererReady()
    }

    init()

    // IPC Listeners
    window.api.onUpdateAvailable((info) => {
      showModal('Update Available', `A new version (${info.latest}) is available. Current: ${info.current}. Download now?`, [
        { label: 'Download', value: true },
        { label: 'Later', value: false }
      ]).then(res => {
        if (res.value) window.api.openExternal(info.url)
      })
    })

    window.api.onTokenStatus((msg) => {
      pushStatus(`System: ${msg}`)
    })
  }, []) // Empty dependency array for mount only

  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden font-['Manrope']">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} username={status.username} canGoLive={status.canGoLive} />
      
      <main className="flex-1 flex flex-col min-w-0 relative bg-[radial-gradient(circle_at_top_right,rgba(49,251,154,0.03),transparent_40%)]">
        <Titlebar />
        
        <PageContainer>
          <AnimatePresence mode="wait">
            {currentPage === 'home' && (
              <Dashboard key="home" status={status} streamData={streamData} onNavigate={setCurrentPage} />
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
              />
            )}
            {currentPage === 'status' && (
              <Pulse key="status" statusLog={statusLog} setStatusLog={setStatusLog} />
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
