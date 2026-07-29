import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { useAuth } from '../hooks/useAuth'
import { auth, db, ref, get, child, set } from '../services/firebase'
import { signOut } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { sendVerificationCode } from '../services/emailjs'

export default function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [emailVerified, setEmailVerified] = useState(false)
  const [verifSending, setVerifSending] = useState(false)

  useEffect(() => {
    if (!user) return
    const dbRef = ref(db)
    get(child(dbRef, `users/${user.uid}`)).then((snapshot) => {
      if (snapshot.exists()) setUserData(snapshot.val())
    })
    get(child(dbRef, `emailVerification/${user.uid}/verified`)).then((snap) => {
      setEmailVerified(snap.val() === true)
    })
  }, [user])

  const handleResendVerification = async () => {
    if (!auth.currentUser) return
    setVerifSending(true)
    try {
      const code = String(Math.floor(100000 + Math.random() * 900000))
      await set(ref(db, `emailVerification/${auth.currentUser.uid}`), {
        code,
        email: auth.currentUser.email,
        createdAt: Date.now(),
        verified: false,
      })
      await sendVerificationCode(auth.currentUser.email, code)
      alert('Verification code sent! Check your inbox.')
    } catch {
      alert('Failed to send verification code.')
    } finally {
      setVerifSending(false)
    }
  }

  const handleRefreshStatus = async () => {
    if (!auth.currentUser) return
    try {
      const snap = await get(ref(db, `emailVerification/${auth.currentUser.uid}/verified`))
      setEmailVerified(snap.val() === true)
    } catch {
      alert('Failed to refresh status.')
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate('/login')
    } catch (e) {
      alert('Failed to log out')
    }
  }

  return (
    <div className="h-dvh flex flex-col bg-app-bg">
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-midnight-blue flex items-center justify-center text-white text-4xl font-bold mb-2">
            {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <h2 className="text-midnight-blue font-bold text-xl">{userData?.name || user?.displayName || 'User'}</h2>
          <p className="text-gray-500 text-sm">{user?.email}</p>
        </div>

        <div className="card mb-4">
          <h3 className="font-bold text-midnight-blue mb-2">Account Details</h3>
          <div className="text-sm space-y-2">
            <div className="flex justify-between"><span className="text-gray-600">Name</span><span className="font-medium">{userData?.name || userData?.fullName || 'N/A'}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Email</span><span className="font-medium">{user?.email}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Phone</span><span className="font-medium">{userData?.number || userData?.phone || 'N/A'}</span></div>
          </div>
        </div>

        <div className="card mb-4">
          <h3 className="font-bold text-midnight-blue mb-2">Email Verification</h3>
          {emailVerified ? (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg">
              <span className="text-sm font-medium">Email Verified</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-3 rounded-lg">
                <span className="text-sm font-medium">Email not verified</span>
              </div>
              <p className="text-xs text-gray-500 px-1">Verify your email to place orders.</p>
              <div className="flex gap-2">
                <button onClick={handleResendVerification} disabled={verifSending} className="btn-primary text-xs px-3 py-2 flex-1">
                  {verifSending ? 'Sending...' : 'Resend verification email'}
                </button>
                <button onClick={handleRefreshStatus} className="btn-secondary text-xs px-3 py-2">
                  Refresh status
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <button onClick={() => navigate('/edit-profile')} className="btn-primary w-full text-left px-4">Edit Profile</button>
          <button onClick={() => navigate('/maps')} className="btn-primary w-full text-left px-4">View Maps</button>
          <button onClick={() => navigate('/orders')} className="btn-primary w-full text-left px-4">View Orders</button>
          <button onClick={() => navigate('/about')} className="btn-primary w-full text-left px-4">About Aquallera</button>
          <button onClick={() => window.location.href = 'mailto:aquallera.main@gmail.com?subject=Bug Report - Aquallera&body=Please describe the issue you encountered in detail:%0A%0A'} className="btn-primary w-full flex items-center px-4"><span>Report Bug</span><span className="text-[10px] ml-auto">aquallera.main@gmail.com</span></button>

          <button onClick={handleLogout} className="w-full bg-red-500 text-white py-3 rounded-lg font-medium text-left px-4">Log Out</button>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
