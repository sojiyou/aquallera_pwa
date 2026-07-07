import { Routes, Route, Navigate } from 'react-router-dom'
import Splash from './pages/Splash'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import VerifyEmail from './pages/VerifyEmail'
import About from './pages/About'
import Maps from './pages/Maps'
import StoreDetails from './pages/StoreDetails'
import CreateOrder from './pages/CreateOrder'
import OrderConfirmation from './pages/OrderConfirmation'
import OrderSuccess from './pages/OrderSuccess'
import Orders from './pages/Orders'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import { useAuth } from './hooks/useAuth'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="h-screen flex items-center justify-center bg-app-bg"><div className="w-8 h-8 border-3 border-midnight-blue border-t-transparent rounded-full animate-spin" /></div>
  if (!user) return <Navigate to="/main" replace />
  if (!user.emailVerified) return <Navigate to="/verify-email" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/main" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
      <Route path="/maps" element={<ProtectedRoute><Maps /></ProtectedRoute>} />
      <Route path="/store/:id" element={<ProtectedRoute><StoreDetails /></ProtectedRoute>} />
      <Route path="/create-order/:id" element={<ProtectedRoute><CreateOrder /></ProtectedRoute>} />
      <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
      <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
