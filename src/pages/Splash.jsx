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
    <div className="h-screen flex flex-col items-center justify-center bg-app-bg">
      <div className="w-[200px] h-[200px] rounded-full bg-midnight-blue flex items-center justify-center mb-4">
        <span className="text-light-yellow text-7xl font-bold">A</span>
      </div>
      <p className="text-gray-500 italic text-base text-center px-4">
        &ldquo;Clean Water, Anytime, Anywhere.&rdquo;
      </p>
      <div className="mt-10">
        <div className="w-8 h-8 border-3 border-midnight-blue border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )
}
