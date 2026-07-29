import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { auth, db, ref, get, set } from '../services/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { getFirebaseErrorMessage } from '../utils/errors'
import Footer from '../components/Footer'
import FloatingInput from '../components/FloatingInput'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please fill all fields'); return }
    setLoading(true)
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      const userSnap = await get(ref(db, `users/${user.uid}`))
      if (!userSnap.exists()) {
        const stationSnap = await get(ref(db, `waterStations/${user.uid}`))
        if (stationSnap.exists()) {
          const station = stationSnap.val()
          await set(ref(db, `users/${user.uid}`), {
            uid: user.uid,
            fullName: station.ownerName || station.stationName || '',
            email: user.email,
            number: station.phone || '',
            createdAt: Date.now()
          })
        } else {
          await set(ref(db, `users/${user.uid}`), {
            uid: user.uid,
            fullName: user.displayName || '',
            email: user.email,
            number: '',
            createdAt: Date.now()
          })
        }
      }

      const verifSnap = await get(ref(db, `emailVerification/${user.uid}/verified`))
      navigate(verifSnap.val() === true ? '/maps' : '/verify-code', { replace: true })
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
          <img src="/logo-no-name.png" alt="Aquallera Logo" className="w-[200px] h-[200px] object-contain mb-2" />
          <div className="w-full max-w-md mx-auto px-10">
            <button onClick={() => navigate(-1)} className="text-light-yellow mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            </button>
            <h1 className="text-light-yellow text-2xl font-bold mb-1">Log In</h1>
            <p className="text-gray-300 text-base mb-6">Welcome! Log in to continue.</p>
            <div className="bg-white rounded-xl shadow-lg p-8 mb-4">
              <form onSubmit={handleSubmit}>
                {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
                <FloatingInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <FloatingInput label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mb-4" required />
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-600 text-sm">Don&apos;t have an account?</p>
                    <Link to="/signup" className="text-midnight-blue text-sm font-medium">Sign Up</Link>
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-[120px]">
                    {loading ? 'Processing...' : 'Log In'}
                  </button>
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
