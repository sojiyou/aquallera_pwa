export default function Footer() {
  return (
    <footer className="bg-footer-bg px-4 py-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-bold text-lg">AQUA-LLERA</span>
        <div className="flex gap-3">
          <img src="/icons8-facebook-48.png" alt="Facebook" className="w-6 h-6" />
          <img src="/icons8-instagram-48.png" alt="Instagram" className="w-6 h-6" />
        </div>
      </div>
      <hr className="border-white/30 mb-2" />
      <p className="text-white text-xs mb-1">Contact Us:</p>
      <div className="flex items-center justify-between">
        <span className="text-white text-[10px]">aquallera@gmail.com</span>
        <span className="text-white text-[10px]">2600, Baguio City Philippines</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-white text-[10px]">0927-7263-218</span>
        <span className="text-white text-[10px]">&copy; 2025 Aqua-llera. All rights reserved.</span>
      </div>
    </footer>
  )
}
