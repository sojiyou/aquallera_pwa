import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'

export default function Home() {
  const navigate = useNavigate()
  return (
    <div className="h-screen flex flex-col bg-app-bg">
      <div className="flex-1 overflow-y-auto px-5 pt-5">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Aquallera Logo" className="w-[120px] h-[120px] object-contain mb-2" />
          <p className="text-gray-500 italic text-sm text-center">&ldquo;Clean Water, Anytime, Anywhere.&rdquo;</p>
        </div>
        <h2 className="text-[#3E5171] font-bold text-xl mb-4">Why make Aquallera?</h2>
        <div className="text-card mb-8">
          <p className="text-[#3E5171] text-sm leading-relaxed">
            We created Aqua-llera with the mission of helping residents of Baguio City gain easier and more reliable access to clean and safe water.
          </p>
        </div>
        <h2 className="text-[#3E5171] font-bold text-xl mb-4 text-right">What is the Aqua-llera App?</h2>
        <div className="text-card mb-8 text-right">
          <p className="text-[#3E5171] text-sm leading-relaxed">
            Aqua-llera is a mobile and web application designed to help Baguio City residents easily locate nearby water stations and order clean, safe water for delivery. The app aims to solve problems of unreliable water supply and late deliveries by providing a convenient, organized, and accessible platform. It promotes sustainability, sanitation, and community well-being by ensuring that every user has quick and dependable access to clean water whenever they need it.
          </p>
        </div>
        <div onClick={() => navigate('/maps')} className="flex items-center justify-center gap-1 pb-8 cursor-pointer">
          <span className="text-[#205476] text-xs">Let&apos;s start Locating</span>
          <span className="text-[#205476] text-xs font-bold italic">Water Stations!</span>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
