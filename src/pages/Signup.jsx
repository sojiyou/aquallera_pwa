import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { auth, db, ref, get, set, query, orderByChild, equalTo } from '../services/firebase'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { getFirebaseErrorMessage } from '../utils/errors'
import Footer from '../components/Footer'

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', number: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const { fullName, email, number, password, confirmPassword } = form
    if (!fullName || !email || !number || !password || !confirmPassword) { setError('Please fill all fields'); return }
    if (!isValidEmail(email)) { setError('Please enter a valid email'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (number.length !== 11) { setError('Please enter a valid 11-digit phone number'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const snapshot = await get(query(ref(db, 'users'), orderByChild('number'), equalTo(number)))
      if (snapshot.exists()) { setError('Phone number already registered. Please use a different number.'); setLoading(false); return }
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, { displayName: fullName })
      await set(ref(db, `users/${cred.user.uid}`), { uid: cred.user.uid, fullName, email, number, createdAt: Date.now() })
      navigate('/maps', { replace: true })
    } catch (err) {
      setError(getFirebaseErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-app-bg">
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center pt-6">
          <img src="/logo.png" alt="Aquallera Logo" className="w-[150px] h-[150px] object-contain mb-6" />
          <div className="w-full px-10">
            <h1 className="text-[#015084] text-2xl font-bold mb-1">Sign Up</h1>
            <p className="text-[#015084] text-base mb-6">Welcome! Create an account to continue.</p>
            <form onSubmit={handleSubmit}>
              {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
              <input name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} className="input-field mb-3" required />
              <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="input-field mb-3" required />
              <input name="number" type="tel" placeholder="Number" value={form.number} onChange={handleChange} className="input-field mb-3" required />
              <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="input-field mb-3" required />
              <input name="confirmPassword" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} className="input-field mb-4" required />
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[#2D2E2E] text-sm">Already have an account?</p>
                  <Link to="/login" className="text-light-yellow text-sm font-medium">Log In</Link>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-[120px]">{loading ? 'Processing...' : 'Sign Up'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
