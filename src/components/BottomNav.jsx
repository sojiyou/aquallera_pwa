import { useLocation, useNavigate } from 'react-router-dom'

const iconClass = (active) =>
  `w-6 h-6 ${active ? 'text-white' : 'text-light-yellow'}`

const MapIcon = ({ active }) => (
  <svg className={iconClass(active)} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
  </svg>
)

const OrdersIcon = ({ active }) => (
  <svg className={iconClass(active)} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
  </svg>
)

const ProfileIcon = ({ active }) => (
  <svg className={iconClass(active)} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
)

const iconComponents = {
  Map: MapIcon,
  Orders: OrdersIcon,
  Profile: ProfileIcon,
}

const tabs = [
  { path: '/maps', label: 'Map', id: 'navMap' },
  { path: '/orders', label: 'Orders', id: 'navOrder' },
  { path: '/profile', label: 'Profile', id: 'navProfile' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="bg-footer-bg h-14 flex items-center px-2 shrink-0 pb-[env(safe-area-inset-bottom)]">
      {tabs.map((tab, i) => {
        const isActive = location.pathname === tab.path
        const Icon = iconComponents[tab.label]

        return (
          <div key={tab.path} className="flex-1 flex items-center justify-center">
            <button
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center w-full h-full py-1 rounded-md
                ${isActive ? 'opacity-100' : 'opacity-60'}`}
            >
              <Icon active={isActive} />
              <span className={`text-[14px] mt-0.5 ${isActive ? 'text-white' : 'text-light-yellow'}`}>
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
