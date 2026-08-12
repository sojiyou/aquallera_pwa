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

        <div className="card mb-4">
          <h3 className="font-bold text-midnight-blue text-sm mb-1">1. Information We Collect</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            When you create an account and use Aquallera, we collect the following personal information:
            your full name, email address, phone number, delivery address and location data (when you
            place a delivery order), and your order history including water type preferences, quantities,
            and payment method. This information is necessary to provide and fulfill our services to you.
          </p>
        </div>

        <div className="card mb-4">
          <h3 className="font-bold text-midnight-blue text-sm mb-1">2. How We Use Your Information</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            We use your information solely to process and fulfill your water orders, send you order
            confirmations and status updates, communicate with you about account-related matters,
            provide customer support, and improve our services. We do not sell, rent, or share your
            personal information with third parties for marketing purposes. Your data is used only
            within the Aquallera platform to deliver the services you request.
          </p>
        </div>

        <div className="card mb-4">
          <h3 className="font-bold text-midnight-blue text-sm mb-1">3. Data Storage and Security</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Your data is stored securely in Firebase Realtime Database, which employs encryption
            in transit (HTTPS) and at rest. Access to your data is restricted to authenticated users
            and authorized administrators. We implement reasonable security measures to protect your
            personal information from unauthorized access, alteration, or disclosure.
          </p>
        </div>

        <div className="card mb-4">
          <h3 className="font-bold text-midnight-blue text-sm mb-1">4. Account Deletion</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            When you delete your account through the app, all your personal data including your
            name, email address, phone number, and delivery addresses are permanently removed from
            our database. To delete your account, all your orders must first be completed or
            cancelled. Your Firebase Authentication account is also deleted. This action
            is irreversible and cannot be undone. You will need to create a new account if you wish
            to use Aquallera again.
          </p>
        </div>

        <div className="card mb-4">
          <h3 className="font-bold text-midnight-blue text-sm mb-1">5. Your Rights</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            You have the right to access your personal data at any time through your profile page.
            You may update or correct your information using the edit profile feature. You may
            delete your account and all associated data at any time. If you have any questions or
            concerns about your data, you may contact us using the information below.
          </p>
        </div>

        <div className="card mb-6">
          <h3 className="font-bold text-midnight-blue text-sm mb-1">6. Contact Us</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            If you have any questions about this privacy notice or how we handle your data, please
            contact us at <span className="font-medium text-midnight-blue">sojodecaran200@gmail.com</span>.
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
