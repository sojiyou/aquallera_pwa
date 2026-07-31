import { useNavigate } from 'react-router-dom'
import { formatDistance } from '../services/haversine'

export default function WaterStationCard({ station, userLocation, onViewOnMap }) {
  const navigate = useNavigate()
  const isApproved = station.status === 'approved'
  const isOnline = station.online || station.isOnline
  const dist = userLocation && station.latitude && station.longitude
    ? formatDistance(calculateDistance(userLocation.lat, userLocation.lng, station.latitude, station.longitude))
    : null

  let statusText = '● Pending Approval'
  let statusColor = 'text-red-600'
  if (isApproved && isOnline) { statusText = '● Online'; statusColor = 'text-green-600' }
  else if (isApproved && !isOnline) { statusText = '● Offline'; statusColor = 'text-orange-500' }

  return (
    <div className="card mx-0 mb-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-midnight-blue text-base flex-1 truncate mr-2">{station.stationName}</h3>
        <span className={`text-xs ${statusColor} bg-green-50 px-2 py-0.5 rounded-full font-medium shrink-0`}>
          {statusText}
        </span>
      </div>
      <div className="flex items-start gap-1 mb-1">
        <p className="text-xs text-gray-500 line-clamp-2">{station.address || 'Address not available'}</p>
      </div>
      <div className="flex items-center gap-1 mb-2">
        <span className="text-xs text-gray-500">{dist ? `${dist} away` : 'Distance unavailable'}</span>
      </div>
      <div className="bg-order-list rounded-lg px-3 py-2 flex flex-wrap gap-x-3 gap-y-1 text-xs mb-3">
        {[
          { key: 'pure', label: 'Pure', price: station.pricing_gallon_pure || 0 },
          { key: 'spring', label: 'Spring', price: station.pricing_liter_spring ?? station.pricing_gallon_spring ?? 0 },
          { key: 'mineral', label: 'Mineral', price: station.pricing_gallon_mineral || 0 },
        ].filter(t => (station.waterTypes?.length ? station.waterTypes : ['pure', 'spring', 'mineral']).includes(t.key)).map(t => (
          <span key={t.key} className="text-gray-600">{t.label}: <strong className="text-midnight-blue">₱{Number(t.price).toFixed(2)}</strong></span>
        ))}
      </div>
      <div className="flex justify-end gap-3">
        <button onClick={() => onViewOnMap?.(station)} className="btn-primary text-xs px-4 py-1.5">View on Map</button>
        <button
          onClick={() => {
            if (!isApproved) { alert('This station is currently not accepting orders'); return }
            navigate(`/create-order/${station.id}`)
          }}
          className={`btn-primary text-xs px-4 py-1.5 ${!isApproved ? 'opacity-50' : ''}`}
        >
          Order Now
        </button>
      </div>
    </div>
  )
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
