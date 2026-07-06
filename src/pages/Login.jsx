import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { auth } from '../services/firebase'
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
      await signInWithEmailAndPassword(auth, email, password)
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
        <div className="flex flex-col items-center pt-8">
          <img src="/logo.png" alt="Aquallera Logo" className="w-[200px] h-[200px] object-contain mb-6" />
          <div className="w-full px-10">
            <button onClick={() => navigate(-1)} className="text-[#015084] mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            </button>
            <h1 className="text-[#015084] text-2xl font-bold mb-1">Log In</h1>
            <p className="text-[#015084] text-base mb-6">Welcome! Log in to continue.</p>
            <form onSubmit={handleSubmit}>
              {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
              <FloatingInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <FloatingInput label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mb-4" required />
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[#2D2E2E] text-sm">Don&apos;t have an account?</p>
                  <Link to="/signup" className="text-light-yellow text-sm font-medium">Sign Up</Link>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-[120px]">
                  {loading ? 'Processing...' : 'Log In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
