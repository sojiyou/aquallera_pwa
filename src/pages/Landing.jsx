import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import DataPrivacyDialog from '../components/DataPrivacyDialog'

export default function Landing() {
  const navigate = useNavigate()
  const [privacyAccepted, setPrivacyAccepted] = useState(
    localStorage.getItem('privacy-accepted') === 'true'
  )

  const handlePrivacyContinue = () => {
    localStorage.setItem('privacy-accepted', 'true')
    setPrivacyAccepted(true)
  }

  if (!privacyAccepted) {
    return <DataPrivacyDialog onContinue={handlePrivacyContinue} />
  }

  return (
    <div className="h-dvh flex flex-col bg-app-bg">
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center px-4 pt-10 pb-6">
          <img src="/logo.png" alt="Aquallera Logo" className="w-[260px] h-[260px] object-contain mb-6" />
          <button onClick={() => navigate('/login')} className="btn-primary w-[200px] mb-3">Log In</button>
          <p className="text-gray-500 italic text-lg mb-3">or</p>
          <button onClick={() => navigate('/signup')} className="btn-primary w-[200px] mb-12">Sign Up</button>
          <p className="text-gray-500 italic text-base text-center mb-1">&ldquo;Clean Water, Anytime, Anywhere.&rdquo;</p>
          <div className="w-[200px] h-0.5 bg-midnight-blue mt-1" />
        </div>
      </div>
      <Footer />
    </div>
  )
}
