import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { db, ref, onValue, get, child } from '../services/firebase'

export default function CreateOrder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [station, setStation] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [orderType, setOrderType] = useState('Delivery')
  const [waterType, setWaterType] = useState('pure')
  const [quantity, setQuantity] = useState(1)
  const [userAddress, setUserAddress] = useState('')
  const [deliveryInstructions, setDeliveryInstructions] = useState('')
  const [location, setLocation] = useState(null)
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [showPreview, setShowPreview] = useState(false)

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

  const prices = {
    pure: station?.pricing_gallon_pure || 0,
    spring: station?.pricing_liter_spring || 0,
    mineral: station?.pricing_gallon_mineral || 0,
  }

  const unitLabels = { pure: 'Gallon', spring: 'Liter', mineral: 'Gallon' }
  const deliveryFee = station?.pricing_delivery_fee || 50
  const transactionFee = 20
  const subtotal = (prices[waterType] || 0) * quantity
  const grandTotal = subtotal + (orderType === 'Delivery' ? deliveryFee : 0) + transactionFee

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
    pureWaterQty: waterType === 'pure' ? quantity : 0,
    pureWaterPrice: waterType === 'pure' ? prices.pure : 0,
    pureWaterTotal: waterType === 'pure' ? subtotal : 0,
    springWaterQty: waterType === 'spring' ? quantity : 0,
    springWaterPrice: waterType === 'spring' ? prices.spring : 0,
    springWaterTotal: waterType === 'spring' ? subtotal : 0,
    mineralWaterQty: waterType === 'mineral' ? quantity : 0,
    mineralWaterPrice: waterType === 'mineral' ? prices.mineral : 0,
    mineralWaterTotal: waterType === 'mineral' ? subtotal : 0,
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

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        alert('Location captured successfully!')
      },
      () => alert('Unable to retrieve your location. Please check your GPS settings.'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const today = new Date().toISOString().split('T')[0]

  if (loading) return <div className="h-screen flex items-center justify-center bg-app-bg"><span className="loading loading-spinner loading-lg text-midnight-blue"></span></div>
  if (!station) return <div className="h-screen flex flex-col items-center justify-center bg-app-bg gap-4"><p className="text-midnight-blue font-bold">Station not found</p><button onClick={() => navigate('/maps')} className="btn-primary">Back to Map</button></div>

  if (showPreview) return (
    <div className="h-screen bg-app-bg flex flex-col">
      <div className="p-4 flex items-center gap-3 border-b border-gray-200">
        <button onClick={() => setShowPreview(false)} className="text-midnight-blue text-xl">&#x2190;</button>
        <h1 className="text-midnight-blue font-bold text-lg">Order Preview</h1>
      </div>
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        <div className="card"><h2 className="font-bold text-midnight-blue mb-2">🛍️ Order Summary</h2><p className="text-sm text-gray-600">Station: <strong>{station.stationName}</strong></p></div>
        <div className="card"><h2 className="font-bold text-midnight-blue mb-2">📦 Items</h2><p className="text-sm text-gray-600 capitalize">{waterType} water - {quantity} {unitLabels[waterType]}(s) at ₱{prices[waterType].toFixed(2)} each</p></div>
        <div className="card"><h2 className="font-bold text-midnight-blue mb-2">🚚 Order Type</h2><p className="text-sm text-gray-600">{orderType}</p></div>
        {orderType === 'Delivery' && location && <div className="card"><h2 className="font-bold text-midnight-blue mb-2">📍 Location</h2><p className="text-sm text-gray-600">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p></div>}
        {userAddress && <div className="card"><h2 className="font-bold text-midnight-blue mb-2">🏠 Address</h2><p className="text-sm text-gray-600">{userAddress}</p></div>}
        {preferredDate && <div className="card"><h2 className="font-bold text-midnight-blue mb-2">📅 Preferred Date</h2><p className="text-sm text-gray-600">{preferredDate}</p></div>}
        {preferredTime && <div className="card"><h2 className="font-bold text-midnight-blue mb-2">⏰ Preferred Time</h2><p className="text-sm text-gray-600">{preferredTime}</p></div>}
        {deliveryInstructions && <div className="card"><h2 className="font-bold text-midnight-blue mb-2">📝 Instructions</h2><p className="text-sm text-gray-600">{deliveryInstructions}</p></div>}
        <div className="card">
          <h2 className="font-bold text-midnight-blue mb-2">💵 Payment Breakdown</h2>
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
    <div className="min-h-screen bg-app-bg flex flex-col">
      <div className="bg-midnight-blue text-white p-4 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate(-1)} className="text-white text-xl">&#x2190;</button>
        <h1 className="text-lg font-bold truncate">New Order</h1>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="card"><h2 className="font-bold text-midnight-blue mb-2">🏪 Station</h2><p className="text-sm text-gray-600">{station.stationName}</p></div>

        <div className="card">
          <h2 className="font-bold text-midnight-blue mb-2">💧 Water Type</h2>
          <div className="flex gap-2">
            {['pure', 'spring', 'mineral'].map((type) => (
              <button key={type} onClick={() => { setWaterType(type); setQuantity(1) }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize ${waterType === type ? 'bg-midnight-blue text-white' : 'bg-input-bg text-gray-600'}`}
              >{type}</button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">₱{(prices[waterType] || 0).toFixed(2)} per {unitLabels[waterType]}</p>
        </div>

        <div className="card">
          <h2 className="font-bold text-midnight-blue mb-2">🔢 Quantity ({unitLabels[waterType]}s)</h2>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-full bg-input-bg flex items-center justify-center text-xl font-bold text-midnight-blue" disabled={quantity <= 1}>-</button>
            <span className="text-3xl font-bold text-midnight-blue w-10 text-center">{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-full bg-input-bg flex items-center justify-center text-xl font-bold text-midnight-blue">+</button>
          </div>
        </div>

        <div className="card">
          <h2 className="font-bold text-midnight-blue mb-2">🚚 Order Type</h2>
          <div className="flex gap-2">
            {['Delivery', 'Pickup'].map((type) => (
              <button key={type} onClick={() => setOrderType(type)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${orderType === type ? 'bg-midnight-blue text-white' : 'bg-input-bg text-gray-600'}`}
              >{type}</button>
            ))}
          </div>
        </div>

        {orderType === 'Delivery' && (
          <>
            <div className="card">
              <h2 className="font-bold text-midnight-blue mb-2">📍 Your Location</h2>
              <button onClick={handleGetLocation}
                className={`w-full py-2 rounded-lg text-sm font-medium ${location ? 'bg-green-500 text-white' : 'bg-input-bg text-gray-600'}`}
              >{location ? '✓ Location Captured' : '📍 Get Current Location'}</button>
              {location && <p className="text-xs text-gray-500 mt-1">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>}
            </div>
            <div className="card">
              <h2 className="font-bold text-midnight-blue mb-2">🏠 Delivery Address</h2>
              <textarea value={userAddress} onChange={(e) => setUserAddress(e.target.value)}
                placeholder="Enter your delivery address" className="input-field min-h-[80px]" />
            </div>
          </>
        )}

        <div className="card">
          <h2 className="font-bold text-midnight-blue mb-2">📅 Preferred Date & Time</h2>
          <div className="flex gap-2">
            <input type="date" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} min={today} className="input-field flex-1" />
            <input type="time" value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} className="input-field flex-1" />
          </div>
        </div>

        <div className="card">
          <h2 className="font-bold text-midnight-blue mb-2">📝 Additional Details</h2>
          <textarea value={deliveryInstructions} onChange={(e) => setDeliveryInstructions(e.target.value)}
            placeholder="e.g., Leave at gate, landmark, etc." className="input-field min-h-[60px]" />
        </div>
      </div>

      <div className="p-4">
        <button onClick={() => setShowPreview(true)} className="btn-primary w-full">Preview Order</button>
      </div>
    </div>
  )
}
