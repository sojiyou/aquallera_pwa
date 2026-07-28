import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Install() {
  const navigate = useNavigate()
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setTimeout(() => navigate('/main', { replace: true }), 1200)
    })
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [navigate])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setIsInstalled(true)
    setDeferredPrompt(null)
  }

  useEffect(() => {
    if (isInstalled) {
      const t = setTimeout(() => navigate('/main', { replace: true }), 1200)
      return () => clearTimeout(t)
    }
  }, [isInstalled, navigate])

  return (
    <div className="h-dvh flex flex-col bg-app-bg">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <img src="/logo.png" alt="Aquallera Logo" className="w-[200px] h-[200px] object-contain mb-6" />
        <h1 className="text-2xl font-bold text-midnight-blue mb-2">Aqua-llera</h1>
        <p className="text-gray-500 text-center text-sm mb-8 max-w-[300px]">
          Find water refilling stations near you, place orders, and enjoy clean drinking water delivered to your doorstep.
        </p>
        {isInstalled ? (
          <p className="text-green-600 font-medium text-sm">App installed! Redirecting...</p>
        ) : (
          <button
            className={`btn-primary w-[200px] flex items-center justify-center gap-2 ${!deferredPrompt ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleInstall}
            disabled={!deferredPrompt}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download App
          </button>
        )}
      </div>
    </div>
  )
}
