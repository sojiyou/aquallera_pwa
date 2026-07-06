import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import BottomNav from '../components/BottomNav'
import WaterStationCard from '../components/WaterStationCard'
import HowToOrderDialog from '../components/HowToOrderDialog'
import { db, ref, onValue } from '../services/firebase'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN
const BURNHAM_CENTER = [120.593, 16.412]
const BAGUIO_BOUNDS = [
  [120.52, 16.36],
  [120.67, 16.46],
]
const MIN_ZOOM = 11
const MAX_ZOOM = 18

export default function Maps() {
  const navigate = useNavigate()
  const mapContainer = useRef(null)
  const map = useRef(null)
  const markersRef = useRef([])
  const markerElsRef = useRef([])
  const labelElsRef = useRef([])
  const userMarkerRef = useRef(null)
  const userMarkerElRef = useRef(null)

  const [mapReady, setMapReady] = useState(false)
  const [mapZoom, setMapZoom] = useState(MIN_ZOOM)
  const [stations, setStations] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [selectedStation, setSelectedStation] = useState(null)
  const [showHowToOrder, setShowHowToOrder] = useState(false)

  useEffect(() => {
    const handleResize = () => map.current?.resize()
    let observer
    if (!map.current && mapContainer.current) {
      mapboxgl.accessToken = MAPBOX_TOKEN
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        attributionControl: false,
        center: BURNHAM_CENTER,
        zoom: MIN_ZOOM,
        maxBounds: BAGUIO_BOUNDS,
      })
      map.current.on('load', () => {
        map.current.resize()
        setMapReady(true)
        setMapZoom(map.current.getZoom())
      })
      map.current.on('zoom', () => setMapZoom(map.current.getZoom()))
      window.addEventListener('resize', handleResize)
      observer = new ResizeObserver(handleResize)
      observer.observe(mapContainer.current)
    }
    return () => {
      window.removeEventListener('resize', handleResize)
      observer?.disconnect()
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      markerElsRef.current = []
      labelElsRef.current = []
      if (userMarkerRef.current) {
        userMarkerRef.current.remove()
        userMarkerRef.current = null
        userMarkerElRef.current = null
      }
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  const getUserMarkerSize = (zoom) => Math.max(14, Math.min(44, 18 + (zoom - 10) * 3))

  const requestUserLocation = useCallback(() => {
    if (!navigator.geolocation || !map.current) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserLocation(loc)

        if (userMarkerRef.current) {
          userMarkerRef.current.remove()
        }

        const size = getUserMarkerSize(mapZoom)
        const el = document.createElement('div')
        el.style.width = size + 'px'
        el.style.height = size + 'px'
        el.innerHTML = `<div style="width:100%;height:100%;border-radius:50%;background:#4285F4;border:2px solid #fff;box-shadow:0 0 0 rgba(66,133,244,0.4);animation:user-pulse 1.5s infinite"/><div style="position:absolute;top:50%;left:50%;width:${size * 0.35}px;height:${size * 0.35}px;transform:translate(-50%,-50%);border-radius:50%;background:#fff;opacity:0.6"/>`
        userMarkerElRef.current = el
        userMarkerRef.current = new mapboxgl.Marker({ element: el })
          .setLngLat([loc.lng, loc.lat])
          .addTo(map.current)

        setTimeout(() => {
          if (map.current) {
            map.current.flyTo({ center: [loc.lng, loc.lat], zoom: 14 })
          }
        }, 2000)
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [mapZoom])



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

  const LABEL_MIN_ZOOM = 13
  const getMarkerSize = (zoom) => Math.max(16, Math.min(48, 20 + (zoom - 10) * 4))
  const getLabelFontSize = (zoom) => zoom < LABEL_MIN_ZOOM ? 0 : Math.max(10, Math.min(16, 8 + (zoom - LABEL_MIN_ZOOM) * 1.5))

  useEffect(() => {
    if (!map.current) return
    if (!mapReady) return
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []
    markerElsRef.current = []
    labelElsRef.current = []
    const size = getMarkerSize(mapZoom)
    const labelFontSize = getLabelFontSize(mapZoom)
    stations.forEach((s) => {
      if (!s.latitude || !s.longitude) return

      const wrapper = document.createElement('div')
      wrapper.className = 'cursor-pointer'
      wrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:2px;'

      const label = document.createElement('span')
      label.textContent = s.stationName
      label.style.cssText = `
        font-size:${Math.max(0, labelFontSize)}px;
        line-height:1.1;
        font-weight:600;
        color:#191970;
        text-shadow:0 0 3px #fff, 0 0 3px #fff, 0 0 3px #fff;
        white-space:nowrap;
        pointer-events:none;
        transition:font-size 0.15s, opacity 0.15s;
        opacity:${labelFontSize > 0 ? 1 : 0};
        max-width:120px;
        overflow:hidden;
        text-overflow:ellipsis;
        text-align:center;
      `

      const icon = document.createElement('div')
      icon.style.width = size + 'px'
      icon.style.height = size + 'px'
      icon.style.transition = 'width 0.15s, height 0.15s'
      icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48">
        <path fill="#33000000" d="M24,46 C18,46 14,43.5 14,44.5 C14,45.3 18.5,47 24,47 C29.5,47 34,45.3 34,44.5 C34,43.5 30,46 24,46Z"/>
        <path fill="#191970" d="M24,4 C24,4 10,18 10,28 C10,35.7 16.3,42 24,42 C31.7,42 38,35.7 38,28 C38,18 24,4 24,4Z"/>
        <path fill="#FFFFFF" d="M20,17 A5,5 0 1,1 20,27 A5,5 0 1,1 20,17 Z"/>
        <path fill="#CCDDFF" d="M21.5,18.5 A2,2 0 1,1 21.5,22.5 A2,2 0 1,1 21.5,18.5 Z"/>
      </svg>`

      wrapper.appendChild(label)
      wrapper.appendChild(icon)

      const marker = new mapboxgl.Marker({ element: wrapper })
        .setLngLat([s.longitude, s.latitude])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<strong>${s.stationName}</strong><br/>${s.address || ''}`))
        .addTo(map.current)
      wrapper.addEventListener('click', () => {
        setSelectedStation(s)
        map.current.flyTo({ center: [s.longitude, s.latitude], zoom: 15 })
      })
      markersRef.current.push(marker)
      markerElsRef.current.push(icon)
      labelElsRef.current.push(label)
    })
  }, [stations, mapReady])

  useEffect(() => {
    if (!markerElsRef.current.length) return
    const size = getMarkerSize(mapZoom)
    const labelFontSize = getLabelFontSize(mapZoom)
    markerElsRef.current.forEach((el) => {
      el.style.width = size + 'px'
      el.style.height = size + 'px'
      el.querySelector('svg')?.setAttribute('width', size)
      el.querySelector('svg')?.setAttribute('height', size)
    })
    labelElsRef.current.forEach((label) => {
      label.style.fontSize = Math.max(0, labelFontSize) + 'px'
      label.style.opacity = labelFontSize > 0 ? 1 : 0
    })
  }, [mapZoom])

  useEffect(() => {
    if (!userMarkerElRef.current) return
    const size = getUserMarkerSize(mapZoom)
    userMarkerElRef.current.style.width = size + 'px'
    userMarkerElRef.current.style.height = size + 'px'
  }, [mapZoom])

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
          <div className="relative">
            <div ref={mapContainer} className="h-[200px] rounded-lg bg-gray-300 overflow-hidden" />
            <button
              onClick={requestUserLocation}
              className="absolute bottom-2 right-2 bg-white text-midnight-blue rounded-full w-9 h-9 flex items-center justify-center shadow-md hover:bg-gray-100"
              title="Find my location"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>
            </button>
          </div>
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
