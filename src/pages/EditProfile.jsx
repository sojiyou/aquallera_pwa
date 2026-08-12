import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { auth, db, ref, get, update, child, remove, deleteUser } from '../services/firebase'
import { signOut } from 'firebase/auth'

export default function EditProfile() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', number: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showActiveOrdersModal, setShowActiveOrdersModal] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)

  useEffect(() => {
    if (!user) return
    const dbRef = ref(db)
    get(child(dbRef, `users/${user.uid}`)).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        setForm({ name: data.name || data.fullName || '', email: data.email || user.email || '', number: data.number || data.phone || '' })
      } else {
        setForm({ name: user.displayName || '', email: user.email || '', number: '' })
      }
      setLoading(false)
    })
  }, [user])

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      alert('Name and email are required.')
      return
    }
    setSaving(true)
    try {
      await update(ref(db, `users/${user.uid}`), {
        name: form.name.trim(),
        email: form.email.trim(),
        number: form.number.trim(),
      })
      alert('Profile updated successfully!')
      navigate('/profile')
    } catch (e) {
      alert('Failed to update profile.')
    } finally {
      setSaving(false)
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
                alert('Unable to check your orders. Please try again.')
              }
            }}
            className="w-full bg-red-500 text-white py-2.5 rounded-lg font-medium text-sm"
          >
            Delete My Account
          </button>
        </div>

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
                        alert('Please log out and log back in before deleting your account.')
                      } else {
                        alert('Failed to delete account. Please try again.')
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
