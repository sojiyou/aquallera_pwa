import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { db, ref, onValue } from '../services/firebase'
import { to12Hour } from '../utils/formatTime'

const DOC_NAMES = {
  businessPermit: 'BP',
  dtiSecRegistration: 'DTI',
  fdaLto: 'FDA',
  sanitaryPermit: 'SP',
}

export default function StoreDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [station, setStation] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stationRef = ref(db, `waterStations/${id}`)
    const unsub = onValue(stationRef, (snapshot) => {
      if (snapshot.exists()) setStation({ id, ...snapshot.val() })
      setLoading(false)
    })
    return () => unsub()
  }, [id])

  if (loading) return (
    <div className="h-dvh flex items-center justify-center bg-app-bg">
      <span className="loading loading-spinner loading-lg text-midnight-blue"></span>
    </div>
  )

  if (!station) return (
    <div className="h-dvh flex flex-col items-center justify-center bg-app-bg gap-4">
      <p className="text-midnight-blue font-bold text-xl">Station not found</p>
      <button onClick={() => navigate('/maps')} className="btn-primary">Back to Map</button>
    </div>
  )

  const isApproved = station.status === 'approved'
  const isOnline = station.online || station.isOnline
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const today = days[new Date().getDay()]

  const formatHours = (hoursStr) => {
    const parts = hoursStr.split(' - ')
    if (parts.length !== 2) return hoursStr
    const converted = parts.map(p => to12Hour(p.trim()))
    const to24 = (t) => {
      const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i)
      if (!m) return 0
      let h = +m[1]
      if (m[3].toUpperCase() === 'PM' && h !== 12) h += 12
      if (m[3].toUpperCase() === 'AM' && h === 12) h = 0
      return h * 60 + +m[2]
    }
    converted.sort((a, b) => to24(a) - to24(b))
    return converted.join(' - ')
  }

  return (
    <div className="min-h-dvh bg-app-bg flex flex-col">
      <div className="bg-midnight-blue text-white p-4">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className="text-white text-xl">&#x2190;</button>
          <h1 className="text-lg font-bold truncate">{station.stationName}</h1>
        </div>
        <p className="text-sm ml-8">{station.address || 'Address not available'}</p>
        <div className="flex gap-2 mt-2 ml-8">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isOnline ? 'bg-green-500' : 'bg-orange-500'} text-white`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isApproved ? 'bg-green-500' : 'bg-orange-500'} text-white`}>
            {isApproved ? 'Approved' : 'Pending'}
          </span>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {station.businessPermitDocuments && Object.keys(station.businessPermitDocuments).length > 0 && (
          <div className="card">
            <h2 className="font-bold text-midnight-blue mb-2">Verified Documents</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(station.businessPermitDocuments)
                .filter(([, d]) => d?.filename || d?.base64)
                .map(([key, d]) => (
                  <span key={key} className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                    <img src="/badge.svg" alt="" className="w-4 h-4" />
                    {DOC_NAMES[key] || key}
                  </span>
                ))}
            </div>
          </div>
        )}

        <div className="card">
          {station.businessHours && (() => {
            const bh = station.businessHours
            if ('open' in bh && 'close' in bh) {
              return (
                <div className="flex justify-between text-base">
                  <span className="font-bold text-midnight-blue">Business Hours</span>
                  <span className="font-bold text-midnight-blue">{to12Hour(bh.open)} - {to12Hour(bh.close)}</span>
                </div>
              )
            }
            return (
              <>
                <h2 className="font-bold text-midnight-blue mb-2">Business Hours</h2>
                {Object.entries(bh).map(([day, hrs]) => (
                  <div key={day} className="flex justify-between text-sm py-0.5">
                    <span className="text-gray-600">{day}</span>
                    <span className={`font-medium ${day === today ? 'text-midnight-blue font-bold' : 'text-gray-600'}`}>{formatHours(hrs)}</span>
                  </div>
                ))}
              </>
            )
          })()}
        </div>

        <div className="card">
          <h2 className="font-bold text-midnight-blue mb-2">Offered Services</h2>
          {(station.serviceTypes && station.serviceTypes.length) > 0 ? (
            <>
              <p className="text-xs text-gray-500 mb-2">
                {station.serviceTypes.includes('delivery') && station.serviceTypes.includes('pickup')
                  ? 'Pickup & Delivery'
                  : station.serviceTypes.includes('delivery')
                    ? 'Delivery Only'
                    : station.serviceTypes.includes('pickup')
                      ? 'Pickup Only'
                      : ''}
              </p>
              <div className="flex flex-wrap gap-2">
                {station.serviceTypes.map((s) => (
                  <span key={s} className="bg-order-list text-midnight-blue text-xs px-3 py-1 rounded-full">{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-xs">No services listed</p>
          )}
        </div>

        {station.serviceTypes?.includes('delivery') && (station.deliveryDays?.length > 0 || station.deliveryHours?.length > 0) && (
          <div className="card">
            <h2 className="font-bold text-midnight-blue mb-2">Delivery Schedule</h2>
            {station.deliveryDays?.length > 0 && (
              <>
                <p className="text-xs text-gray-500 mb-1">Days</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {station.deliveryDays.map((day) => (
                    <span key={day} className="bg-order-list text-midnight-blue text-xs px-3 py-1 rounded-full capitalize">{day}</span>
                  ))}
                </div>
              </>
            )}
            {station.deliveryHours?.length > 0 && (
              <>
                <p className="text-xs text-gray-500 mb-1">Hours</p>
                <div className="flex flex-wrap gap-2">
                  {station.deliveryHours.map((time, i) => (
                    <span key={i} className="bg-order-list text-midnight-blue text-xs px-3 py-1 rounded-full">{to12Hour(time)}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="card">
          <h2 className="font-bold text-midnight-blue mb-2">Price List</h2>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'pure', label: 'Pure (Gallon)', price: station.pricing_gallon_pure || 0 },
              { key: 'spring', label: 'Spring (Gallon)', price: station.pricing_liter_spring ?? station.pricing_gallon_spring ?? 0 },
              { key: 'mineral', label: 'Mineral (Gallon)', price: station.pricing_gallon_mineral || 0 },
            ].filter(t => (station.waterTypes?.length ? station.waterTypes : ['pure', 'spring', 'mineral']).includes(t.key)).map(t => (
              <div key={t.key} className="bg-order-list rounded-lg p-2 text-center">
                <p className="text-xs text-gray-600">{t.label}</p>
                <p className="text-midnight-blue font-bold">₱{Number(t.price).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {station.about && (
          <div className="card">
            <h2 className="font-bold text-midnight-blue mb-2">About</h2>
            <p className="text-sm text-gray-600">{station.about}</p>
          </div>
        )}
      </div>

      <div className="p-4 flex gap-3">
        <button onClick={() => navigate(-1)} className="btn-secondary flex-1">Return</button>
        <button
          onClick={() => {
            if (!isApproved) { alert('This station is not yet accepting orders'); return }
            navigate(`/create-order/${station.id}`)
          }}
          className={`btn-primary flex-1 ${!isApproved ? 'opacity-50' : ''}`}
        >
          Order Now
        </button>
      </div>
    </div>
  )
}
