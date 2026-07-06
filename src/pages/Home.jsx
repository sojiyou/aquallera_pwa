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
        <h2 className="text-[#3E5171] font-bold text-xl mb-4">What is the Aqua-llera App?</h2>
        <div className="text-card mb-8">
          <p className="text-[#3E5171] text-sm leading-relaxed">
            Aqua-llera is your go-to app for finding nearby water stations and ordering clean, safe water right from your phone. No more stressing over where to get water or waiting forever for deliveries — we made it simple, organized, and hassle-free. It's all about making sure you always have quick and dependable access to clean water, whenever you need it.
          </p>
        </div>
        <h2 className="text-[#3E5171] font-bold text-xl mb-4 text-right">Why make Aquallera?</h2>
        <div className="text-card mb-8 text-right">
          <p className="text-[#3E5171] text-sm leading-relaxed">
            We created Aqua-llera to help Baguio City residents get clean water more easily and reliably. It also helps centralize information about water stations, so you can find what you need without all the usual hassle.
          </p>
        </div>
        <h2 className="text-[#3E5171] font-bold text-xl mb-4">How to Order</h2>
        <div className="text-card mb-8">
          <p className="text-[#3E5171] text-sm leading-relaxed">
            Getting started is super easy! Just open the app and allow location access to see nearby water stations. Pick your preferred water type and how much you need, then choose between delivery or pickup. Review your order, hit confirm, and you're all set — your clean water will be on its way!
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
