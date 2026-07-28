import { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { auth, sendEmailVerification } from '../services/firebase'
import { useAuth } from '../hooks/useAuth'
import { signOut } from 'firebase/auth'

export default function VerifyEmail() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [verifSending, setVerifSending] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!auth.currentUser) return
      try {
        await auth.currentUser.reload()
        if (auth.currentUser.emailVerified) {
          window.location.reload()
        }
      } catch {}
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleResend = async () => {
    if (!auth.currentUser) return
    setVerifSending(true)
    setStatusMsg('')
    try {
      await sendEmailVerification(auth.currentUser)
      setStatusMsg('Verification email sent! Check your inbox.')
    } catch (err) {
      console.error('sendEmailVerification error:', err.code, err.message)
      setStatusMsg('Failed to send verification email. Try again later.')
    } finally {
      setVerifSending(false)
    }
  }

  if (loading) return <div className="h-dvh flex items-center justify-center bg-app-bg"><span className="loading loading-spinner loading-lg text-midnight-blue"></span></div>
  if (!user) return <Navigate to="/main" replace />
  if (user.emailVerified) return <Navigate to="/maps" replace />

  return (
    <div className="h-dvh flex flex-col items-center justify-center bg-app-bg px-6">
      <img src="/logo.png" alt="Aquallera Logo" className="w-[120px] h-[120px] object-contain mb-6" />
      <h1 className="text-midnight-blue font-bold text-xl mb-2">Verify Your Email</h1>
      <p className="text-gray-500 text-sm text-center mb-2">
        A verification link has been sent to:
      </p>
      <p className="text-midnight-blue font-semibold text-sm mb-6">{user.email}</p>
      <p className="text-gray-500 text-xs text-center mb-1">
        Click the link in the email to activate your account.
      </p>
      <p className="text-gray-400 text-xs text-center mb-1">
        Didn&apos;t receive it? Check your spam or junk folder.
      </p>
      <p className="text-gray-400 text-xs text-center mb-6 flex items-center justify-center gap-1">
        <span className="w-3 h-3 border-2 border-midnight-blue border-t-transparent rounded-full animate-spin inline-block" />
        Waiting for email verification...
      </p>

      {statusMsg && (
        <p className="text-sm text-center mb-4 text-gray-700 bg-gray-100 px-4 py-2 rounded-lg">{statusMsg}</p>
      )}

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button onClick={handleResend} disabled={verifSending} className="btn-primary w-full">
          {verifSending ? 'Sending...' : 'Resend verification email'}
        </button>
        <button onClick={() => { signOut(auth); navigate('/login') }} className="text-gray-400 text-xs underline mt-4">
          Back to Login
        </button>
      </div>
    </div>
  )
}
