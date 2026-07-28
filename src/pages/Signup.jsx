import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { auth, db, ref, get, set, query, orderByChild, equalTo, sendEmailVerification } from '../services/firebase'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { getFirebaseErrorMessage } from '../utils/errors'
import Footer from '../components/Footer'
import FloatingInput from '../components/FloatingInput'

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', number: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'number') {
      setForm({ ...form, number: value.replace(/\D/g, '').slice(0, 11) })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

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
      const phoneSnap = await get(query(ref(db, 'users'), orderByChild('number'), equalTo(number)))
      if (phoneSnap.exists()) { setError('Phone number already registered. Please use a different number.'); setLoading(false); return }

      const emailUserSnap = await get(query(ref(db, 'users'), orderByChild('email'), equalTo(email)))
      if (emailUserSnap.exists()) { setError('This email is already registered as a customer. Please log in instead.'); setLoading(false); return }

      const emailStationSnap = await get(query(ref(db, 'waterStations'), orderByChild('email'), equalTo(email)))
      if (emailStationSnap.exists()) { setError('This email is already registered as a station owner. Please log in using your existing account.'); setLoading(false); return }

      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, { displayName: fullName })
      await set(ref(db, `users/${cred.user.uid}`), { uid: cred.user.uid, fullName, email, number, createdAt: Date.now() })
      await sendEmailVerification(cred.user)
      navigate('/verify-email', { replace: true })
    } catch (err) {
      setError(getFirebaseErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-dvh flex flex-col bg-gradient-to-b from-blue to-midnight-blue relative overflow-hidden">
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 1440 900" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="#E5C95F" d="M0,200L48,213.3C96,226.7,192,253.3,288,250.7C384,248,480,216,576,213.3C672,210.7,768,237.3,864,245.3C960,253.3,1056,242.7,1152,224C1248,205.3,1344,178.7,1392,165.3L1440,152L1440,900L1392,900C1344,900,1248,900,1152,900C1056,900,960,900,864,900C768,900,672,900,576,900C480,900,384,900,288,900C192,900,96,900,48,900L0,900Z"/>
        <path fill="#E5C95F" d="M0,350L48,338.7C96,327.3,192,304.7,288,320C384,335.3,480,388.7,576,396C672,403.3,768,364.7,864,346.7C960,328.7,1056,331.3,1152,352C1248,372.7,1344,411.3,1392,430.7L1440,450L1440,900L1392,900C1344,900,1248,900,1152,900C1056,900,960,900,864,900C768,900,672,900,576,900C480,900,384,900,288,900C192,900,96,900,48,900L0,900Z"/>
        <path fill="#ffffff" d="M0,550L48,565.3C96,580.7,192,611.3,288,608C384,604.7,480,568,576,554.7C672,541.3,768,552,864,578.7C960,605.3,1056,648,1152,632C1248,616,1344,541.3,1392,504L1440,466.7L1440,900L1392,900C1344,900,1248,900,1152,900C1056,900,960,900,864,900C768,900,672,900,576,900C480,900,384,900,288,900C192,900,96,900,48,900L0,900Z"/>
      </svg>
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="flex flex-col items-center pt-4">
          <img src="/logo-no-name.png" alt="Aquallera Logo" className="w-[150px] h-[150px] object-contain mb-6" />
          <div className="w-full max-w-md mx-auto px-10">
            <button onClick={() => navigate(-1)} className="text-light-yellow mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            </button>
            <h1 className="text-light-yellow text-2xl font-bold mb-1">Sign Up</h1>
            <p className="text-gray-300 text-base mb-6">Welcome! Create an account to continue.</p>
            <div className="bg-white rounded-xl shadow-lg p-8 mb-4">
              <form onSubmit={handleSubmit}>
                {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
                <FloatingInput label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} required />
                <FloatingInput label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />
                <FloatingInput label="Number" type="tel" name="number" value={form.number} onChange={handleChange} required />
                <FloatingInput label="Password" type="password" name="password" value={form.password} onChange={handleChange} required />
                <FloatingInput label="Confirm Password" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="mb-4" required />
                <p className="text-xs text-gray-400 text-center mb-3">
                  By creating an account, you agree to our data practices. We collect your name, email, and phone number
                  to process your orders and send updates. Deleting your account removes all personal data
                  and cancels pending orders.
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-600 text-sm">Already have an account?</p>
                    <Link to="/login" className="text-midnight-blue text-sm font-medium">Log In</Link>
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-[120px]">{loading ? 'Processing...' : 'Sign Up'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
