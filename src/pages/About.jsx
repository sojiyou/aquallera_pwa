import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'

export default function About() {
  const navigate = useNavigate()
  return (
    <div className="h-dvh flex flex-col bg-app-bg">
      <div className="bg-midnight-blue text-white p-4 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate(-1)} className="text-white text-xl">&#x2190;</button>
        <h1 className="text-lg font-bold">About Aquallera</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pt-4">
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.png" alt="Aquallera Logo" className="w-[100px] h-[100px] object-contain mb-2" />
          <p className="text-gray-500 italic text-sm text-center">&ldquo;Clean Water, Anytime, Anywhere.&rdquo;</p>
        </div>

        <h2 className="font-bold text-midnight-blue text-lg mb-3">What is the Aqua-llera App?</h2>
        <div className="card mb-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            Aqua-llera is your go-to app for finding nearby water stations and ordering clean, safe water right from your phone. No more stressing over where to get water or waiting forever for deliveries — we made it simple, organized, and hassle-free. It's all about making sure you always have quick and dependable access to clean water, whenever you need it.
          </p>
        </div>

        <h2 className="font-bold text-midnight-blue text-lg mb-3">Why make Aquallera?</h2>
        <div className="card mb-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            We created Aqua-llera to help Baguio City residents get clean water more easily and reliably. It also helps centralize information about water stations, so you can find what you need without all the usual hassle.
          </p>
        </div>

        <h2 className="font-bold text-midnight-blue text-lg mb-3">How to Order</h2>
        <div className="card mb-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            Getting started is super easy! Just open the app and allow location access to see nearby water stations. Pick your preferred water type and how much you need, then choose between delivery or pickup. Review your order, hit confirm, and you're all set — your clean water will be on its way!
          </p>
        </div>

        <h2 className="font-bold text-midnight-blue text-lg mb-3">Data Privacy</h2>
        <div className="card mb-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            We collect your name, email, phone number, delivery address, and order history to process your orders and send updates. Your data is stored securely and is never shared with third parties. Deleting your account removes all personal data and cancels any pending orders.
          </p>
        </div>

        <div onClick={() => navigate('/maps')} className="flex items-center justify-center gap-1 pb-6 cursor-pointer">
          <span className="text-midnight-blue text-sm">Let&apos;s start Locating</span>
          <span className="text-midnight-blue text-sm font-bold italic">Water Stations!</span>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
