import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { auth, db, ref, get, update, child, remove, deleteUser, query, orderByChild, equalTo } from '../services/firebase'
import { signOut, updateProfile, updateEmail, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'
import { sendVerificationCode } from '../services/emailjs'

export default function EditProfile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [form, setForm] = useState({ name: '', email: '', number: '' })
  const [originalEmail, setOriginalEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showActiveOrdersModal, setShowActiveOrdersModal] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)

  const [showOtpDialog, setShowOtpDialog] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [password, setPassword] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [otpCooldown, setOtpCooldown] = useState(0)
  const [otpError, setOtpError] = useState('')
  const [otpSentTo, setOtpSentTo] = useState('')
  const intervalRef = useRef(null)

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  useEffect(() => {
    if (!user) return
    const dbRef = ref(db)
    get(child(dbRef, `users/${user.uid}`)).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        const email = data.email || user.email || ''
        setForm({ name: data.name || data.fullName || '', email, number: data.number || data.phone || '' })
        setOriginalEmail(email)
      } else {
        const email = user.email || ''
        setForm({ name: user.displayName || '', email, number: '' })
        setOriginalEmail(email)
      }
      setLoading(false)
    })
  }, [user])

  const startCooldown = () => {
    setOtpCooldown(30)
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setOtpCooldown((prev) => {
        if (prev <= 1) { clearInterval(intervalRef.current); intervalRef.current = null; return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const isEmailTaken = async (email) => {
    const usersSnap = await get(query(ref(db, 'users'), orderByChild('email'), equalTo(email)))
    if (usersSnap.exists()) {
      let found = false
      usersSnap.forEach((child) => { if (child.key !== user.uid) found = true })
      if (found) return true
    }
    const stationsSnap = await get(query(ref(db, 'waterStations'), orderByChild('email'), equalTo(email)))
    return stationsSnap.exists()
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      addToast('Name and email are required.', 'error')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email.trim())) {
      addToast('Please enter a valid email address.', 'error')
      return
    }
    setSaving(true)
    try {
      const emailChanged = form.email.trim() !== originalEmail
      if (emailChanged) {
        const taken = await isEmailTaken(form.email.trim())
        if (taken) {
          addToast('This email is already in use.', 'error')
          setSaving(false)
          return
        }
        const code = String(Math.floor(100000 + Math.random() * 900000))
        await set(ref(db, `emailChange/${user.uid}`), {
          code,
          newEmail: form.email.trim(),
          createdAt: Date.now(),
          verified: false,
        })
        const sent = await sendVerificationCode(form.email.trim(), code)
        if (!sent) {
          addToast('Failed to send verification code. Please try again.', 'error')
          setSaving(false)
          return
        }
        setOtpSentTo(form.email.trim())
        setOtpCode('')
        setPassword('')
        setOtpError('')
        setShowOtpDialog(true)
        startCooldown()
        setSaving(false)
        return
      }
      await update(ref(db, `users/${user.uid}`), {
        name: form.name.trim(),
        email: form.email.trim(),
        number: form.number.trim(),
        fullName: form.name.trim(),
      })
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: form.name.trim() })
      }
      addToast('Profile updated successfully!', 'success')
      navigate('/profile')
    } catch (e) {
      addToast('Failed to update profile.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) return
    if (!password.trim()) {
      setOtpError('Please enter your password.')
      return
    }
    if (!auth.currentUser) return
    setVerifying(true)
    setOtpError('')
    try {
      const snap = await get(ref(db, `emailChange/${user.uid}`))
      if (!snap.exists()) {
        setOtpError('No verification code found. Please resend.')
        setVerifying(false)
        return
      }
      const data = snap.val()
      if (data.verified) {
        setShowOtpDialog(false)
        setVerifying(false)
        return
      }
      if (Date.now() - data.createdAt > 600000) {
        setOtpError('Code expired. Please resend.')
        setVerifying(false)
        return
      }
      if (otpCode !== data.code) {
        setOtpError('Incorrect code. Try again.')
        setVerifying(false)
        return
      }
      const newEmail = form.email.trim()
      const credential = EmailAuthProvider.credential(auth.currentUser.email, password)
      await reauthenticateWithCredential(auth.currentUser, credential)
      await updateEmail(auth.currentUser, newEmail)
      await set(ref(db, `emailChange/${user.uid}/verified`), true)
      await update(ref(db, `users/${user.uid}`), {
        name: form.name.trim(),
        email: newEmail,
        number: form.number.trim(),
        fullName: form.name.trim(),
      })
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: form.name.trim() })
      }
      setOriginalEmail(newEmail)
      setShowOtpDialog(false)
      addToast('Email updated successfully!', 'success')
      navigate('/profile')
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setOtpError('Incorrect password. Please try again.')
      } else if (err.code === 'auth/requires-recent-login') {
        setOtpError('Please log out and log back in before changing your email.')
      } else {
        setOtpError(err.message || 'Verification failed. Please try again.')
      }
    } finally {
      setVerifying(false)
    }
  }

  const handleResendOtp = async () => {
    if (otpCooldown > 0 || sendingOtp || !otpSentTo) return
    setOtpError('')
    setSendingOtp(true)
    try {
      const code = String(Math.floor(100000 + Math.random() * 900000))
      await set(ref(db, `emailChange/${user.uid}`), {
        code,
        newEmail: otpSentTo,
        createdAt: Date.now(),
        verified: false,
      })
      await sendVerificationCode(otpSentTo, code)
      startCooldown()
      addToast('Verification code sent!', 'success')
    } catch {
      setOtpError('Failed to resend code. Please try again.')
    } finally {
      setSendingOtp(false)
    }
  }

  if (loading) return <div className="h-dvh flex items-center justify-center bg-app-bg"><span className="loading loading-spinner loading-lg text-midnight-blue"></span></div>

  return (
    <div className="h-dvh bg-app-bg flex flex-col">
      <div className="bg-midnight-blue text-white p-4 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate('/profile')} className="text-white text-xl">&#x2190;</button>
        <h1 className="text-lg font-bold">Edit Profile</h1>
      </div>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="card">
          <h2 className="font-bold text-midnight-blue mb-1">Name</h2>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full Name" className="input-field" />
        </div>
        <div className="card">
          <h2 className="font-bold text-midnight-blue mb-1">Email</h2>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email Address" className="input-field" />
        </div>
        <div className="card">
          <h2 className="font-bold text-midnight-blue mb-1">Phone Number</h2>
          <input type="tel" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} placeholder="Phone Number" className="input-field" />
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>

        <div className="card border border-red-200">
          <h3 className="font-bold text-red-700 mb-2">Delete Account</h3>
          <p className="text-xs text-gray-600 mb-3">
            Permanently delete your account and all associated data. This cannot be undone.
          </p>
          <button
            onClick={async () => {
              try {
                const ordersSnap = await get(ref(db, 'orders'))
                let hasActive = false
                if (ordersSnap.exists()) {
                  ordersSnap.forEach((child) => {
                    const o = child.val()
                    if ((o.userId === user.uid || o.customerId === user.uid) && !['completed', 'cancelled'].includes((o.status || '').toLowerCase())) {
                      hasActive = true
                    }
                  })
                }
                if (hasActive) setShowActiveOrdersModal(true)
                else setShowDeleteModal(true)
              } catch {
                addToast('Unable to check your orders. Please try again.', 'error')
              }
            }}
            className="w-full bg-red-500 text-white py-2.5 rounded-lg font-medium text-sm"
          >
            Delete My Account
          </button>
        </div>

        {showOtpDialog && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => !verifying && setShowOtpDialog(false)}>
            <div className="bg-white rounded-2xl p-5 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h2 className="font-bold text-lg text-midnight-blue mb-1">Verify Email Change</h2>
              <p className="text-sm text-gray-600 mb-1">Enter the 6-digit code sent to:</p>
              <p className="text-sm font-semibold text-midnight-blue mb-4">{otpSentTo}</p>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full h-14 rounded-xl bg-gray-100 text-center text-2xl font-bold text-midnight-blue tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-midnight-blue placeholder-gray-400 mb-3"
                autoFocus
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Current password"
                className="input-field mb-3"
              />

              {otpError && (
                <p className="text-red-600 text-sm mb-3 bg-red-50 px-3 py-2 rounded-lg">{otpError}</p>
              )}

              <div className="flex gap-3 mb-3">
                <button onClick={() => { setShowOtpDialog(false); setVerifying(false) }} disabled={verifying} className="btn-secondary flex-1">Later</button>
                <button onClick={handleVerifyOtp} disabled={verifying || otpCode.length !== 6 || !password.trim()} className="btn-primary flex-1">
                  {verifying ? 'Verifying...' : 'Verify & Save'}
                </button>
              </div>

              <button
                onClick={handleResendOtp}
                disabled={otpCooldown > 0 || sendingOtp}
                className="text-midnight-blue text-sm underline w-full text-center disabled:opacity-40 disabled:no-underline"
              >
                {sendingOtp ? 'Sending...' : otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Resend code'}
              </button>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => !deletingAccount && setShowDeleteModal(false)}>
            <div className="bg-white rounded-2xl p-5 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-red-700 font-bold text-lg mb-3">Delete Account</h2>
              <p className="text-sm text-gray-600 mb-4">
                This action is <strong>permanent and irreversible</strong>.
              </p>
              <ul className="text-sm text-gray-600 space-y-2 mb-6 list-disc pl-5">
                <li>All your personal data will be permanently removed.</li>
                <li>You will no longer be able to access this account.</li>
              </ul>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} disabled={deletingAccount} className="btn-secondary flex-1">Cancel</button>
                <button
                  onClick={async () => {
                    if (deletingAccount || !user) return
                    setDeletingAccount(true)
                    try {
                      await remove(ref(db, `users/${user.uid}`))
                      await deleteUser(auth.currentUser)
                      await signOut(auth)
                      navigate('/main', { replace: true })
                    } catch (err) {
                      if (err.code === 'auth/requires-recent-login') {
                        addToast('Please log out and log back in before deleting your account.', 'error')
                      } else {
                        addToast('Failed to delete account. Please try again.', 'error')
                      }
                      setDeletingAccount(false)
                    }
                  }}
                  disabled={deletingAccount}
                  className="flex-1 py-2.5 rounded-lg font-medium text-sm bg-red-500 text-white disabled:opacity-50"
                >
                  {deletingAccount ? 'Deleting...' : 'Delete My Account'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showActiveOrdersModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowActiveOrdersModal(false)}>
            <div className="bg-white rounded-2xl p-5 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-red-700 font-bold text-lg mb-3">Active Orders Found</h2>
              <p className="text-sm text-gray-600 mb-6">
                Your account still has orders that are not yet completed or cancelled. Please complete
                or cancel all your orders before deleting your account.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowActiveOrdersModal(false)} className="btn-secondary flex-1">Close</button>
                <button onClick={() => { setShowActiveOrdersModal(false); navigate('/orders') }} className="btn-primary flex-1">
                  Go to My Orders
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
