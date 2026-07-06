import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { useAuth } from '../hooks/useAuth'
import { auth, db, ref, get, child } from '../services/firebase'
import { signOut } from 'firebase/auth'
import { useEffect, useState } from 'react'

export default function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    if (!user) return
    const dbRef = ref(db)
    get(child(dbRef, `users/${user.uid}`)).then((snapshot) => {
      if (snapshot.exists()) setUserData(snapshot.val())
    })
  }, [user])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate('/login')
    } catch (e) {
      alert('Failed to log out')
    }
  }

  return (
    <div className="h-screen flex flex-col bg-app-bg">
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

        <div className="space-y-2">
          <button onClick={() => navigate('/edit-profile')} className="btn-primary w-full text-left px-4">✏️ Edit Profile</button>
          <button onClick={() => navigate('/maps')} className="btn-primary w-full text-left px-4">🗺️ View Maps</button>
          <button onClick={() => navigate('/orders')} className="btn-primary w-full text-left px-4">📋 View Orders</button>
          <button onClick={() => navigate('/home')} className="btn-primary w-full text-left px-4">🏠 About Aqullera</button>
          <button onClick={handleLogout} className="w-full bg-red-500 text-white py-3 rounded-lg font-medium text-left px-4">🚪 Log Out</button>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
