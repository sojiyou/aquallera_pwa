import { useLocation, useNavigate } from 'react-router-dom'

export default function OrderSuccess() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const data = state || {}

  return (
    <div className="h-screen bg-app-bg flex flex-col items-center pt-16 px-6">
      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-3xl mb-4">&#x2713;</div>
      <h1 className="text-midnight-blue font-bold text-2xl mb-2">Order Placed!</h1>
      <p className="text-gray-500 text-sm text-center mb-6">Your order has been placed successfully.</p>

      <div className="card w-full mb-6">
        <h2 className="font-bold text-midnight-blue mb-2">Order Details</h2>
        <div className="text-sm space-y-1">
          <div className="flex justify-between"><span className="text-gray-600">Reference #</span><span className="font-medium">{data.referenceNumber}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Station</span><span className="font-medium">{data.stationName}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Order Type</span><span className="font-medium">{data.orderType}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Date</span><span className="font-medium">{data.date || 'N/A'}</span></div>
          <hr className="my-1" />
          <div className="flex justify-between font-bold text-midnight-blue"><span>Total</span><span>₱{(data.grandTotal || 0).toFixed(2)}</span></div>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center mb-6">You can track your order status in the Orders tab.</p>

      <div className="w-full flex flex-col gap-3 px-4">
        <button onClick={() => navigate('/home')} className="btn-primary w-full">Back to Home</button>
        <button onClick={() => navigate('/orders')} className="btn-secondary w-full">View My Orders</button>
      </div>
    </div>
  )
}
