import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { auth, db, ref, get, set } from '../services/firebase'
import { signOut } from 'firebase/auth'
import { sendVerificationCode } from '../services/emailjs'
import DataPrivacyDialog from '../components/DataPrivacyDialog'

export default function VerifyCode() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [codeInput, setCodeInput] = useState('')
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [resending, setResending] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  useEffect(() => {
    if (!user) return
    const verifRef = ref(db, `emailVerification/${user.uid}/verified`)
    get(verifRef).then((snap) => {
      if (snap.val() === true) setShowPrivacy(true)
    })
  }, [user])

  const startCooldown = () => {
    setCooldown(30)
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(intervalRef.current); intervalRef.current = null; return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const handleVerify = async () => {
    if (!codeInput.trim() || codeInput.length !== 6 || !auth.currentUser) return
    setError('')
    setVerifying(true)
    try {
      const snap = await get(ref(db, `emailVerification/${auth.currentUser.uid}`))
      if (!snap.exists()) { setError('No verification code found. Please resend.'); setVerifying(false); return }

      const data = snap.val()
      if (data.verified) { navigate('/maps', { replace: true }); return }

      if (Date.now() - data.createdAt > 600000) { setError('Code expired. Please resend.'); setVerifying(false); return }

      if (codeInput !== data.code) { setError('Incorrect code. Try again.'); setVerifying(false); return }

      await set(ref(db, `emailVerification/${auth.currentUser.uid}/verified`), true)
      setShowPrivacy(true)
    } catch {
      setError('Verification failed. Please try again.')
      setVerifying(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0 || resending || !auth.currentUser) return
    setError('')
    setResending(true)
    try {
      const code = String(Math.floor(100000 + Math.random() * 900000))
      await set(ref(db, `emailVerification/${auth.currentUser.uid}`), {
        code,
        email: auth.currentUser.email,
        createdAt: Date.now(),
        verified: false,
      })
      await sendVerificationCode(auth.currentUser.email, code)
      startCooldown()
    } catch {
      setError('Failed to resend code. Please try again.')
    } finally {
      setResending(false)
    }
  }

  if (loading) return <div className="h-dvh flex items-center justify-center bg-app-bg"><div className="w-8 h-8 border-3 border-midnight-blue border-t-transparent rounded-full animate-spin" /></div>
  if (!user) return null

  return (
    <div className="h-dvh flex flex-col bg-gradient-to-b from-blue to-midnight-blue">
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <img src="/logo-no-name.png" alt="Aquallera" className="w-[120px] h-[120px] object-contain mb-6" />

        <h1 className="text-light-yellow text-2xl font-bold mb-2">Verify Your Email</h1>
        <p className="text-gray-300 text-sm text-center mb-1">
          Enter the 6-digit code sent to:
        </p>
        <p className="text-light-yellow font-semibold text-sm mb-6">{user.email}</p>

        <div className="w-full max-w-xs mb-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className="w-full h-16 rounded-xl bg-white text-center text-3xl font-bold text-midnight-blue tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-light-yellow placeholder-gray-300"
            autoFocus
          />
        </div>

        {error && (
          <p className="text-red-300 text-sm text-center mb-4 bg-red-900/30 px-4 py-2 rounded-lg w-full max-w-xs">
            {error}
          </p>
        )}

        <button
          onClick={handleVerify}
          disabled={verifying || codeInput.length !== 6}
          className="btn-primary w-full max-w-xs mb-3 py-3"
        >
          {verifying ? 'Verifying...' : 'Verify'}
        </button>

        <button
          onClick={handleResend}
          disabled={cooldown > 0 || resending}
          className="text-light-yellow text-sm underline disabled:opacity-40 disabled:no-underline mb-8"
        >
          {resending ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
        </button>

        <button
          onClick={() => { signOut(auth); navigate('/login') }}
          className="text-gray-400 text-xs underline"
        >
          Back to Login
        </button>
      </div>

      {showPrivacy && (
        <DataPrivacyDialog onContinue={() => {
          localStorage.setItem('privacy-accepted', 'true')
          navigate('/maps', { replace: true })
        }} />
      )}
    </div>
  )
}