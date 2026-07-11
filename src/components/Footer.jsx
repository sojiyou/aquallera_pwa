export default function Footer() {
  return (
    <footer className="bg-footer-bg px-4 py-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-bold text-lg">AQUA-LLERA</span>
        <div className="flex gap-3">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-mist-gray">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <a href="https://aquallera-website.vercel.app/" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-mist-gray">
              <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </a>
        </div>
      </div>
      <hr className="border-white/30 mb-2" />
      <p className="text-white text-xs mb-1">Contact Us:</p>
      <div className="flex items-center justify-between">
        <span className="text-white text-[12px]">aquallera@gmail.com</span>
        <span className="text-white text-[12px]">2600, Baguio City Philippines</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-white text-[12px]">0927-7263-218</span>
        <span className="text-white text-[12px]">&copy; 2025 Aqua-llera. All rights reserved.</span>
      </div>
    </footer>
  )
}
