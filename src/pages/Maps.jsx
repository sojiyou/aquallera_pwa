import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import mapboxgl from 'mapbox-gl'
import BottomNav from '../components/BottomNav'
import WaterStationCard from '../components/WaterStationCard'
import HowToOrderDialog from '../components/HowToOrderDialog'
import { db, ref, onValue } from '../services/firebase'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN
const BAGUIO_CENTER = [120.5931, 16.4164]

export default function Maps() {
  const navigate = useNavigate()
  const mapContainer = useRef(null)
  const map = useRef(null)
  const markersRef = useRef([])

  const [stations, setStations] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [selectedStation, setSelectedStation] = useState(null)
  const [showHowToOrder, setShowHowToOrder] = useState(false)

  useEffect(() => {
    if (!map.current && mapContainer.current) {
      mapboxgl.accessToken = MAPBOX_TOKEN
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: BAGUIO_CENTER,
        zoom: 11,
      })
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-left')
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          setUserLocation(loc)
          new mapboxgl.Marker({ color: '#4285F4' })
            .setLngLat([loc.lng, loc.lat])
            .setPopup(new mapboxgl.Popup().setText('You are here'))
            .addTo(map.current)
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000 }
      )
    }
    return () => { markersRef.current.forEach((m) => m.remove()); markersRef.current = [] }
  }, [])

  useEffect(() => {
    const stationsRef = ref(db, 'waterStations')
    const unsub = onValue(stationsRef, (snapshot) => {
      const list = []
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const data = child.val()
          list.push({ id: child.key, ...data })
        })
      }
      setStations(list)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!map.current) return
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []
    stations.forEach((s) => {
      if (!s.latitude || !s.longitude) return
      const el = document.createElement('div')
      el.className = 'w-8 h-8 bg-midnight-blue rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md cursor-pointer'
      el.innerHTML = '💧'
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([s.longitude, s.latitude])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<strong>${s.stationName}</strong><br/>${s.address || ''}`))
        .addTo(map.current)
      el.addEventListener('click', () => {
        setSelectedStation(s)
        map.current.flyTo({ center: [s.longitude, s.latitude], zoom: 15 })
      })
      markersRef.current.push(marker)
    })
  }, [stations])

  const handleViewOnMap = useCallback((station) => {
    setSelectedStation(station)
    if (map.current) {
      map.current.flyTo({ center: [station.longitude, station.latitude], zoom: 15 })
    }
  }, [])

  return (
    <div className="h-screen flex flex-col bg-app-bg">
      <div className="flex items-center gap-3 px-3 py-2 bg-app-bg shrink-0">
        <img src="/logo-no-name.png" alt="Aquallera Logo" className="w-[60px] h-[60px] object-contain shrink-0" />
        <div className="flex-1">
          <h1 className="text-midnight-blue font-bold text-lg leading-tight">Aquallera</h1>
          <p className="text-gray-500 italic text-xs">&ldquo;Clean Water, Anytime, Anywhere.&rdquo;</p>
        </div>
        <button onClick={() => setShowHowToOrder(true)} className="btn-primary text-[8px] px-2 py-1 leading-none">How to Order</button>
      </div>
      <div className="flex-1 flex flex-col px-3 gap-2 pb-2 overflow-hidden">
        <div className="bg-midnight-blue rounded-lg p-2">
          <h2 className="text-white font-bold text-sm mb-1">📍 Water Stations Near You</h2>
          <div ref={mapContainer} className="h-[200px] rounded-lg bg-gray-300" />
          {selectedStation && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-white text-sm flex-1 truncate">{selectedStation.stationName}</span>
              <button onClick={() => navigate(`/store/${selectedStation.id}`)} className="bg-[#ECEFF1] text-midnight-blue text-xs px-3 py-1 rounded-lg">View Details</button>
            </div>
          )}
        </div>
        <div className="flex-1 bg-white rounded-lg p-3 flex flex-col min-h-0">
          <h3 className="text-midnight-blue font-bold text-sm mb-2">💧 All Water Stations</h3>
          <div className="flex-1 overflow-y-auto space-y-2">
            {stations.length > 0 ? stations.map((s) => (
              <WaterStationCard key={s.id} station={s} userLocation={userLocation} onViewOnMap={handleViewOnMap} />
            )) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <span className="text-5xl mb-2">📭</span>
                <p className="text-sm">No water stations available</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <BottomNav />
      {showHowToOrder && <HowToOrderDialog onClose={() => setShowHowToOrder(false)} />}
    </div>
  )
}
