import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { db, ref, get, update, child } from '../services/firebase'

export default function EditProfile() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', number: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
      </div>
    </div>
  )
}
