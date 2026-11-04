import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { db, ref, get } from './services/firebase'
import { useAuth } from './hooks/useAuth'
import Splash from './pages/Splash'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Install from './pages/Install'
import VerifyCode from './pages/VerifyCode'
import About from './pages/About'
import Maps from './pages/Maps'
import StoreDetails from './pages/StoreDetails'
import CreateOrder from './pages/CreateOrder'
import OrderConfirmation from './pages/OrderConfirmation'
import OrderSuccess from './pages/OrderSuccess'
import Orders from './pages/Orders'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import { ToastProvider } from './hooks/useToast'
import ToastContainer from './components/ToastContainer'
import NotificationListener from './components/NotificationListener'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const [verified, setVerified] = useState(null)

  useEffect(() => {
    setVerified(null)
    if (!user) return
    let cancelled = false
    get(ref(db, `emailVerification/${user.uid}/verified`))
      .then(snap => {
        if (!cancelled) setVerified(snap.val() === true)
      })
      .catch(() => {
        if (!cancelled) setVerified(false)
      })
    return () => { cancelled = true }
  }, [user])

  if (loading) return <div className="h-dvh flex items-center justify-center bg-app-bg"><div className="w-8 h-8 border-[3px] border-midnight-blue border-t-transparent rounded-full animate-spin" /></div>
  if (!user) return <Navigate to="/main" replace />
  if (verified === null) return <div className="h-dvh flex items-center justify-center bg-app-bg"><div className="w-8 h-8 border-[3px] border-midnight-blue border-t-transparent rounded-full animate-spin" /></div>
  if (!verified) return <Navigate to="/verify-code" replace />
  return children
}

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/main" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
        <Route path="/maps" element={<ProtectedRoute><Maps /></ProtectedRoute>} />
        <Route path="/store/:id" element={<ProtectedRoute><StoreDetails /></ProtectedRoute>} />
        <Route path="/create-order/:id" element={<ProtectedRoute><CreateOrder /></ProtectedRoute>} />
        <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
        <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/install" element={<Install />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <NotificationListener />
      <ToastContainer />
    </ToastProvider>
  )
}
