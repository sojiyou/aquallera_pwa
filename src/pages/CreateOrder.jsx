import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { WheelPicker, WheelPickerWrapper } from '@ncdai/react-wheel-picker'
import { useAuth } from '../hooks/useAuth'
import { to12Hour } from '../utils/formatTime'
import { auth, db, ref, onValue, get, child, sendEmailVerification } from '../services/firebase'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

export default function CreateOrder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [station, setStation] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [orderType, setOrderType] = useState('Delivery')
  const [quantities, setQuantities] = useState({ pure: 0, spring: 0, mineral: 0 })
  const [userAddress, setUserAddress] = useState('')
  const [deliveryInstructions, setDeliveryInstructions] = useState('')
  const [location, setLocation] = useState(null)
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [addressSearch, setAddressSearch] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [pickupHour, setPickupHour] = useState(8)
  const [pickupMinute, setPickupMinute] = useState(0)
  const [pickupMeridiem, setPickupMeridiem] = useState('AM')
  const searchContainerRef = useRef(null)

  useEffect(() => {
    const stationRef = ref(db, `waterStations/${id}`)
    const unsub = onValue(stationRef, (snapshot) => {
      if (snapshot.exists()) setStation({ id, ...snapshot.val() })
      setLoading(false)
    })
    return () => unsub()
  }, [id])

  useEffect(() => {
    if (!user) return
    get(child(ref(db), `users/${user.uid}`)).then((snapshot) => {
      if (snapshot.exists()) setUserData(snapshot.val())
    })
  }, [user])

  const availableOrderTypes = station?.serviceTypes?.length
    ? station.serviceTypes.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    : ['Delivery', 'Pickup']

  useEffect(() => {
    if (!station) return
    if (station.serviceTypes?.length) {
      if (!station.serviceTypes.includes('delivery')) setOrderType('Pickup')
      else if (!station.serviceTypes.includes('pickup')) setOrderType('Delivery')
    }
  }, [station])

  const prices = {
    pure: station?.pricing_gallon_pure || 0,
    spring: station?.pricing_liter_spring ?? station?.pricing_gallon_spring ?? 0,
    mineral: station?.pricing_gallon_mineral || 0,
  }

  const waterTypeMeta = [
    { key: 'pure', label: 'Pure', unit: 'Gallon' },
    { key: 'spring', label: 'Spring', unit: 'Gallon' },
    { key: 'mineral', label: 'Mineral', unit: 'Gallon' },
  ]
  const deliveryFee = station?.pricing_delivery_fee || 50
  const transactionFee = 5
  const subtotal = Object.entries(prices).reduce((sum, [type, price]) => sum + (price * (quantities[type] || 0)), 0)
  const grandTotal = subtotal + (orderType === 'Delivery' ? deliveryFee : 0) + transactionFee
  const hasItems = Object.values(quantities).some(q => q > 0)
  const emailUnverified = !user?.emailVerified
  const [verifSending, setVerifSending] = useState(false)

  const buildOrderData = () => ({
    customerId: user.uid,
    userId: user.uid,
    userEmail: user.email,
    stationId: id,
    stationName: station.stationName,
    customerName: userData?.fullName || user?.displayName || '',
    customerPhone: userData?.number || '',
    orderType,
    status: 'pending',
    pureWaterQty: quantities.pure || 0,
    pureWaterPrice: prices.pure,
    pureWaterTotal: (prices.pure || 0) * (quantities.pure || 0),
    springWaterQty: quantities.spring || 0,
    springWaterPrice: prices.spring,
    springWaterTotal: (prices.spring || 0) * (quantities.spring || 0),
    mineralWaterQty: quantities.mineral || 0,
    mineralWaterPrice: prices.mineral,
    mineralWaterTotal: (prices.mineral || 0) * (quantities.mineral || 0),
    waterSubtotal: subtotal,
    deliveryFee: orderType === 'Delivery' ? deliveryFee : 0,
    transactionFee,
    grandTotal,
    deliveryLatitude: location?.lat || 0,
    deliveryLongitude: location?.lng || 0,
    date: preferredDate,
    time: preferredTime,
    referenceNumber: 'AQ' + Date.now().toString(36).toUpperCase(),
    additionalDetails: deliveryInstructions,
    locationDetails: userAddress,
    deliveryAddress: orderType === 'Delivery' ? userAddress : '',
    paymentMethod: 'Cash on Delivery',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      if (!MAPBOX_TOKEN) return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&limit=1`
      )
      const data = await res.json()
      if (data.features?.length) return data.features[0].place_name
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    } catch {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
  }, [])

  const searchAddress = useCallback(async (query) => {
    if (!query.trim()) { setSuggestions([]); return }
    setIsSearching(true)
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${MAPBOX_TOKEN}&country=PH&types=address,place,poi,locality,neighborhood,district&` +
        `language=en&limit=8&autocomplete=true&fuzzyMatch=true`
      )
      const data = await res.json()
      setSuggestions(data.features || [])
    } catch { setSuggestions([]) }
    finally { setIsSearching(false) }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (addressSearch && !location) searchAddress(addressSearch)
      else if (!addressSearch) setSuggestions([])
    }, 400)
    return () => clearTimeout(timer)
  }, [addressSearch, location, searchAddress])

  useEffect(() => {
    const handleClick = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSuggestions([])
      }
    }
    if (suggestions.length) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [suggestions])

  const selectSuggestion = (result) => {
    const [lng, lat] = result.center
    setLocation({ lat, lng })
    setAddressSearch(result.place_name)
    setUserAddress(result.place_name)
    setSuggestions([])
  }

  const handleAddressChange = (e) => {
    const val = e.target.value
    setAddressSearch(val)
    setUserAddress(val)
    if (!val || !location) setSuggestions([])
    if (!val && location) {
      setLocation(null)
      setSuggestions([])
    }
  }

  const clearAddress = () => {
    setAddressSearch('')
    setUserAddress('')
    setLocation(null)
    setSuggestions([])
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setLocation({ lat, lng })
        const address = await reverseGeocode(lat, lng)
        setAddressSearch(address)
        setUserAddress(address)
        setSuggestions([])
      },
      (err) => {
        if (err.code === 1) {
          alert('Location access was denied. Please enable location permissions in your browser settings and try again.')
        } else if (err.code === 2) {
          alert('Unable to retrieve your location. Please check your GPS settings and try again.')
        } else if (err.code === 3) {
          alert('Location request timed out. Please try again in an open area.')
        } else {
          alert('Unable to retrieve your location. Please check your GPS settings.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleResendVerification = async () => {
    if (!auth.currentUser) return
    setVerifSending(true)
    try {
      await sendEmailVerification(auth.currentUser)
      alert('Verification email sent! Check your inbox.')
    } catch {
      alert('Failed to send verification email.')
    } finally {
      setVerifSending(false)
    }
  }

  const parse12h = (s) => {
    const m = s.match(/^(\d+):(\d+)\s*(AM|PM)$/i)
    if (!m) return null
    return { h: +m[1], m: +m[2], p: m[3].toUpperCase() }
  }

  const to24h = (h, p) => {
    if (p === 'AM') return h === 12 ? 0 : h
    return h === 12 ? 12 : h + 12
  }

  const getBounds = (station, dateStr) => {
    if (!station?.businessHours || !dateStr) return null
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
    const dayName = days[new Date(dateStr + 'T00:00:00').getDay()]
    const hStr = station.businessHours[dayName]
    if (!hStr) return null
    const [o, c] = hStr.split(' - ')
    const op = parse12h(o), cl = parse12h(c)
    if (!op || !cl) return null
    return {
      open: { ...op, h24: to24h(op.h, op.p) },
      close: { ...cl, h24: to24h(cl.h, cl.p) }
    }
  }

  const pickupTimeMeta = useMemo(() => {
    const bounds = getBounds(station, preferredDate)
    const minOpts = [{ label: '00', value: 0 }, { label: '30', value: 30 }]

    if (!bounds) {
      const hours = Array.from({ length: 12 }, (_, i) => ({
        label: String(i + 1).padStart(2, '0'), value: i + 1
      }))
      return { hours, minutes: minOpts, meridiems: [{ label: 'AM', value: 'AM' }, { label: 'PM', value: 'PM' }] }
    }

    const { open, close } = bounds
    const openTotal = open.h24 + open.m / 60
    const closeTotal = close.h24 + close.m / 60

    const hours = []
    const meridiems = []
    const seenM = new Set()

    for (let h = 1; h <= 12; h++) {
      const am24 = to24h(h, 'AM')
      const pm24 = to24h(h, 'PM')
      const amValid = am24 >= openTotal && am24 < closeTotal
      const pmValid = pm24 >= openTotal && pm24 < closeTotal

      if (amValid || pmValid) hours.push({ label: String(h).padStart(2, '0'), value: h })
      if (amValid && !seenM.has('AM')) { meridiems.push({ label: 'AM', value: 'AM' }); seenM.add('AM') }
      if (pmValid && !seenM.has('PM')) { meridiems.push({ label: 'PM', value: 'PM' }); seenM.add('PM') }
    }

    return { hours, minutes: minOpts, meridiems }
  }, [station, preferredDate])

  useEffect(() => {
    if (!pickupTimeMeta.hours.length) return
    const validHours = pickupTimeMeta.hours.map(o => o.value)
    if (!validHours.includes(pickupHour)) setPickupHour(validHours[0])
    const validMeridiems = pickupTimeMeta.meridiems.map(o => o.value)
    if (!validMeridiems.includes(pickupMeridiem)) setPickupMeridiem(validMeridiems[0])
  }, [pickupTimeMeta])

  useEffect(() => {
    if (orderType !== 'Pickup') return
    if (pickupTimeMeta.hours.length === 0) return
    const h24 = to24h(pickupHour, pickupMeridiem)
    setPreferredTime(`${String(h24).padStart(2, '0')}:${String(pickupMinute).padStart(2, '0')}`)
  }, [pickupHour, pickupMinute, pickupMeridiem, orderType, pickupTimeMeta])

  const today = new Date().toISOString().split('T')[0]

  if (loading) return <div className="h-dvh flex items-center justify-center bg-app-bg"><span className="loading loading-spinner loading-lg text-midnight-blue"></span></div>
  if (!station) return <div className="h-dvh flex flex-col items-center justify-center bg-app-bg gap-4"><p className="text-midnight-blue font-bold">Station not found</p><button onClick={() => navigate('/maps')} className="btn-primary">Back to Map</button></div>

  if (showPreview) return (
    <div className="h-dvh bg-app-bg flex flex-col">
      <div className="p-4 flex items-center gap-3 border-b border-gray-200">
        <button onClick={() => setShowPreview(false)} className="text-midnight-blue text-xl">&#x2190;</button>
        <h1 className="text-midnight-blue font-bold text-lg">Order Preview</h1>
      </div>
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        <div className="card"><h2 className="font-bold text-midnight-blue mb-2">Order Summary</h2><p className="text-sm text-gray-600">Station: <strong>{station.stationName}</strong></p></div>
        <div className="card">
          <h2 className="font-bold text-midnight-blue mb-2">Items</h2>
          <div className="space-y-1">
            {waterTypeMeta.filter(t => quantities[t.key] > 0).map(t => (
              <p key={t.key} className="text-sm text-gray-600 capitalize">{t.label} water — {quantities[t.key]} {t.unit}(s) at ₱{(prices[t.key] || 0).toFixed(2)} each</p>
            ))}
          </div>
        </div>
        <div className="card"><h2 className="font-bold text-midnight-blue mb-2">Order Type</h2><p className="text-sm text-gray-600">{orderType}</p></div>
        {userAddress && <div className="card"><h2 className="font-bold text-midnight-blue mb-2">Delivery Address</h2><p className="text-sm text-gray-600">{userAddress}</p></div>}
        {preferredDate && <div className="card"><h2 className="font-bold text-midnight-blue mb-2">Preferred Date</h2><p className="text-sm text-gray-600">{preferredDate}</p></div>}
        {preferredTime && <div className="card"><h2 className="font-bold text-midnight-blue mb-2">Preferred Time</h2><p className="text-sm text-gray-600">{to12Hour(preferredTime)}</p></div>}
        {deliveryInstructions && <div className="card"><h2 className="font-bold text-midnight-blue mb-2">Instructions</h2><p className="text-sm text-gray-600">{deliveryInstructions}</p></div>}
        <div className="card">
          <h2 className="font-bold text-midnight-blue mb-2">Payment Breakdown</h2>
          <div className="text-sm space-y-1">
            <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>₱{subtotal.toFixed(2)}</span></div>
            {orderType === 'Delivery' && <div className="flex justify-between"><span className="text-gray-600">Delivery Fee</span><span>₱{deliveryFee.toFixed(2)}</span></div>}
            <div className="flex justify-between"><span className="text-gray-600">Transaction Fee</span><span>₱{transactionFee.toFixed(2)}</span></div>
            <hr className="my-1" />
            <div className="flex justify-between font-bold text-midnight-blue"><span>Grand Total</span><span>₱{grandTotal.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
      <div className="p-4 flex gap-3">
        <button onClick={() => setShowPreview(false)} className="btn-secondary flex-1">Edit Order</button>
        <button onClick={() => navigate('/order-confirmation', { state: { orderData: buildOrderData(), userEmail: user.email, userName: userData?.fullName || user.displayName } })} className="btn-primary flex-1">Proceed</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-dvh bg-app-bg flex flex-col">
      <div className="bg-midnight-blue text-white p-4 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate(-1)} className="text-white text-xl">&#x2190;</button>
        <h1 className="text-lg font-bold truncate">New Order</h1>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="card"><h2 className="font-bold text-midnight-blue mb-2">Station</h2><p className="text-sm text-gray-600">{station.stationName}</p></div>

        {emailUnverified && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <p className="text-amber-800 text-sm font-medium">Email not verified</p>
                <p className="text-amber-700 text-xs mt-1">Please verify your email to place orders.</p>
                <button onClick={handleResendVerification} disabled={verifSending} className="text-amber-800 text-xs font-medium underline mt-1">
                  {verifSending ? 'Sending...' : 'Resend verification email'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <h2 className="font-bold text-midnight-blue mb-2">Select Quantities</h2>
          <div className="space-y-3">
            {waterTypeMeta.map(({ key, label, unit }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium capitalize text-midnight-blue">{label}</p>
                  <p className="text-xs text-gray-500">₱{(prices[key] || 0).toFixed(2)} / {unit}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQuantities(q => ({ ...q, [key]: Math.max(0, q[key] - 1) }))}
                    className="w-8 h-8 rounded-full bg-input-bg flex items-center justify-center text-lg font-bold text-midnight-blue"
                    disabled={!quantities[key]}>-</button>
                  <span className="text-xl font-bold text-midnight-blue w-6 text-center">{quantities[key] || 0}</span>
                  <button onClick={() => setQuantities(q => ({ ...q, [key]: q[key] + 1 }))}
                    className="w-8 h-8 rounded-full bg-input-bg flex items-center justify-center text-lg font-bold text-midnight-blue">+</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="font-bold text-midnight-blue mb-2">Order Type</h2>
          <div className="flex gap-2">
            {availableOrderTypes.map((type) => (
              <button key={type} onClick={() => setOrderType(type)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${orderType === type ? 'bg-midnight-blue text-white' : 'bg-input-bg text-gray-600'}`}
              >{type}</button>
            ))}
          </div>
        </div>

        {orderType === 'Delivery' && (
          <div className="card">
            <h2 className="font-bold text-midnight-blue mb-2">Delivery Address</h2>
            <div className="relative" ref={searchContainerRef}>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={addressSearch}
                    onChange={handleAddressChange}
                    placeholder="Type your address or use GPS..."
                    className="input-field w-full pr-8"
                  />
                  {addressSearch && (
                    <button
                      type="button"
                      onClick={clearAddress}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm leading-none"
                    >✕</button>
                  )}
                </div>
                <button
                  onClick={handleGetLocation}
                  className="px-3 py-2 rounded-lg bg-midnight-blue text-white text-sm shrink-0"
                    title="Get current location"
                >GPS</button>
              </div>
              {isSearching && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2 p-2">
                  <span className="w-4 h-4 border-2 border-midnight-blue border-t-transparent rounded-full animate-spin" />
                  Searching...
                </div>
              )}
              {suggestions.length > 0 && !location && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 max-h-[200px] overflow-y-auto z-50 shadow-lg">
                  {suggestions.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      onClick={() => selectSuggestion(result)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">{result.text}</div>
                        <div className="text-xs text-gray-500 truncate">{result.place_name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="card">
          <h2 className="font-bold text-midnight-blue mb-2">Preferred Date</h2>
          <label className="input-field w-full flex items-center gap-2 cursor-pointer relative">
            <svg className="w-5 h-5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className={preferredDate ? 'text-gray-800' : 'text-gray-400'}>{preferredDate || 'Select date'}</span>
            <input
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              min={today}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
        </div>

        {preferredDate && orderType === 'Delivery' && station && station.deliveryHours && station.deliveryHours.length > 0 && (
          <div className="card">
            <h2 className="font-bold text-midnight-blue mb-2">Delivery Time</h2>
            <p className="text-xs text-gray-500 mb-2">Select a delivery time slot</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {station.deliveryHours.map((time) => (
                <button
                  key={time}
                  onClick={() => setPreferredTime(time)}
                  className={`h-11 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
                    preferredTime === time
                      ? 'bg-midnight-blue text-white'
                      : 'bg-input-bg text-gray-600 active:bg-gray-300'
                  }`}
                >{to12Hour(time)}</button>
              ))}
            </div>
          </div>
        )}

        {preferredDate && orderType === 'Pickup' && pickupTimeMeta.hours.length > 0 && (
          <div className="card">
            <h2 className="font-bold text-midnight-blue mb-2">Pickup Time</h2>
            <div className="flex justify-center gap-1">
              <WheelPickerWrapper>
                <WheelPicker
                  options={pickupTimeMeta.hours}
                  value={pickupHour}
                  onValueChange={setPickupHour}
                  visibleCount={5}
                  optionItemHeight={36}
                  infinite
                />
              </WheelPickerWrapper>
              <span className="flex items-center text-lg font-bold text-midnight-blue self-center">:</span>
              <WheelPickerWrapper>
                <WheelPicker
                  options={pickupTimeMeta.minutes}
                  value={pickupMinute}
                  onValueChange={setPickupMinute}
                  visibleCount={5}
                  optionItemHeight={36}
                  infinite
                />
              </WheelPickerWrapper>
              {pickupTimeMeta.meridiems.length > 1 && (
                <WheelPickerWrapper>
                  <WheelPicker
                    options={pickupTimeMeta.meridiems}
                    value={pickupMeridiem}
                    onValueChange={setPickupMeridiem}
                    visibleCount={5}
                    optionItemHeight={36}
                  />
                </WheelPickerWrapper>
              )}
            </div>
          </div>
        )}

        <div className="card">
          <h2 className="font-bold text-midnight-blue mb-2">Additional Details</h2>
          <textarea value={deliveryInstructions} onChange={(e) => setDeliveryInstructions(e.target.value)}
            placeholder="e.g., Leave at gate, landmark, etc." className="input-field min-h-[60px]" />
        </div>
      </div>

      <div className="p-4">
        <button onClick={() => setShowPreview(true)} className="btn-primary w-full" disabled={!hasItems || emailUnverified}>Preview Order</button>
      </div>
    </div>
  )
}
