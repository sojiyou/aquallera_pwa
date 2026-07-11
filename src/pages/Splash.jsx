import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, onAuthStateChanged } from '../services/firebase'

export default function Splash() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          navigate('/maps', { replace: true })
        } else {
          navigate('/main', { replace: true })
        }
      })
    }, 1500)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="h-dvh flex flex-col items-center justify-center bg-app-bg">
      <img src="/logo-no-name.png" alt="Aquallera" className="w-[180px] h-[180px] object-contain mb-4" />
      <p className="text-gray-500 italic text-base text-center px-4">
        &ldquo;Clean Water, Anytime, Anywhere.&rdquo;
      </p>
      <div className="mt-10">
        <div className="w-8 h-8 border-3 border-midnight-blue border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )
}
