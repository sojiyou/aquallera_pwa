import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Install() {
  const navigate = useNavigate()
  const [deferredPrompt, setDeferredPrompt] = useState(window.__deferredPrompt || null)
  const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => {
      navigate('/main', { replace: true })
    })
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [navigate])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    try {
      deferredPrompt.prompt()
      await deferredPrompt.userChoice
    } catch (e) {
      // Event already consumed, ignore
    }
  }

  return (
    <div className="h-dvh flex flex-col bg-app-bg">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <img src="/logo.png" alt="Aquallera Logo" className="w-[200px] h-[200px] object-contain mb-6" />
        <h1 className="text-2xl font-bold text-midnight-blue mb-2">Aqua-llera</h1>
        <p className="text-gray-500 text-center text-sm mb-8 max-w-[300px]">
          Find water refilling stations near you, place orders, and enjoy clean drinking water delivered to your doorstep.
        </p>
        <button
          className={`btn-primary w-[200px] flex items-center justify-center gap-2 ${isStandalone ? 'opacity-60' : ''}`}
          onClick={handleInstall}
          disabled={isStandalone}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {isStandalone ? 'Installed' : 'Download App'}
        </button>
      </div>
    </div>
  )
}
