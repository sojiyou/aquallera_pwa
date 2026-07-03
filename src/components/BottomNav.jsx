import { useLocation, useNavigate } from 'react-router-dom'

const tabs = [
  { path: '/maps', label: 'Map', icon: '🗺️', id: 'navMap' },
  { path: '/orders', label: 'Orders', icon: '📋', id: 'navOrder' },
  { path: '/profile', label: 'Profile', icon: '👤', id: 'navProfile' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="bg-footer-bg h-16 flex items-center px-2 shrink-0">
      {tabs.map((tab, i) => {
        const isActive = location.pathname === tab.path
        return (
          <div key={tab.path} className="flex-1 flex items-center justify-center">
            <button
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center w-full h-full py-2 rounded-md
                ${isActive ? 'opacity-100' : 'opacity-60'}`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className={`text-xs mt-0.5 ${isActive ? 'text-blue' : 'text-light-yellow'}`}>
                {tab.label}
              </span>
            </button>
            {i < tabs.length - 1 && <div className="w-px h-10 bg-light-yellow/50" />}
          </div>
        )
      })}
    </nav>
  )
}
