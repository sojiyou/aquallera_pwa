import { useLocation, useNavigate } from 'react-router-dom'
import { sendOrderConfirmationEmail } from '../services/emailjs'
import { db, ref, set, generateReferenceNumber } from '../services/firebase'
import { useState } from 'react'

export default function OrderConfirmation() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const orderData = state?.orderData

  if (!orderData) return (
    <div className="h-screen flex flex-col items-center justify-center bg-app-bg gap-4">
      <p className="text-midnight-blue font-bold">No order data found.</p>
      <button onClick={() => navigate('/maps')} className="btn-primary">Back to Maps</button>
    </div>
  )

  const handleConfirm = async () => {
    if (saving) return
    setSaving(true)
    try {
      const orderId = await generateReferenceNumber(orderData.stationName)

      const finalOrder = {
        ...orderData,
        orderId,
        referenceNumber: orderId,
        status: 'Pending',
        updatedAt: new Date().toISOString(),
      }

      await set(ref(db, `orders/${orderId}`), finalOrder)

      await sendOrderConfirmationEmail(
        state?.userEmail || orderData.userEmail || '',
        state?.userName || orderData.customerName || 'Customer',
        orderId,
        orderData.grandTotal,
        orderData.date || orderData.createdAt,
        orderData.stationName
      ).catch(() => {})

      navigate('/order-success', {
        state: {
          referenceNumber: orderId,
          stationName: orderData.stationName,
          grandTotal: orderData.grandTotal,
          orderType: orderData.orderType,
          date: orderData.date || orderData.createdAt,
        }
      })
    } catch (e) {
      setSaving(false)
      alert('Failed to place order. Please try again.')
    }
  }

  return (
    <div className="h-screen bg-app-bg flex flex-col">
      <div className="p-4 flex items-center gap-3 border-b border-gray-200">
        <button onClick={() => navigate(-1)} className="text-midnight-blue text-xl">&#x2190;</button>
        <h1 className="text-midnight-blue font-bold text-lg">Confirm Order</h1>
      </div>
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        <div className="card"><h2 className="font-bold text-midnight-blue mb-2">🛍️ Order Summary</h2><p className="text-sm text-gray-600">Station: <strong>{orderData.stationName}</strong></p></div>
        <div className="card"><h2 className="font-bold text-midnight-blue mb-2">📦 Items</h2>
          {orderData.pureWaterQty > 0 && <p className="text-sm text-gray-600">Pure Water: {orderData.pureWaterQty} Gal(s) — ₱{orderData.pureWaterTotal.toFixed(2)}</p>}
          {orderData.springWaterQty > 0 && <p className="text-sm text-gray-600">Spring Water: {orderData.springWaterQty} L(s) — ₱{orderData.springWaterTotal.toFixed(2)}</p>}
          {orderData.mineralWaterQty > 0 && <p className="text-sm text-gray-600">Mineral Water: {orderData.mineralWaterQty} Gal(s) — ₱{orderData.mineralWaterTotal.toFixed(2)}</p>}
          <p className="text-sm text-gray-600 mt-1">Subtotal: <strong>₱{orderData.waterSubtotal.toFixed(2)}</strong></p>
        </div>
        <div className="card"><h2 className="font-bold text-midnight-blue mb-2">🚚 Order Type</h2><p className="text-sm text-gray-600">{orderData.orderType}</p></div>
        {orderData.locationDetails && <div className="card"><h2 className="font-bold text-midnight-blue mb-2">🏠 Address</h2><p className="text-sm text-gray-600">{orderData.locationDetails}</p></div>}
        {orderData.additionalDetails && <div className="card"><h2 className="font-bold text-midnight-blue mb-2">📝 Instructions</h2><p className="text-sm text-gray-600">{orderData.additionalDetails}</p></div>}
        <div className="card">
          <h2 className="font-bold text-midnight-blue mb-2">💵 Payment Breakdown</h2>
          <div className="text-sm space-y-1">
            <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>₱{orderData.waterSubtotal.toFixed(2)}</span></div>
            {orderData.deliveryFee > 0 && <div className="flex justify-between"><span className="text-gray-600">Delivery Fee</span><span>₱{orderData.deliveryFee.toFixed(2)}</span></div>}
            <div className="flex justify-between"><span className="text-gray-600">Transaction Fee</span><span>₱{(orderData.transactionFee || 20).toFixed(2)}</span></div>
            <hr className="my-1" />
            <div className="flex justify-between font-bold text-midnight-blue"><span>Grand Total</span><span>₱{orderData.grandTotal.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
      <div className="p-4 flex gap-3">
        <button onClick={() => navigate(-1)} className="btn-secondary flex-1" disabled={saving}>Edit Order</button>
        <button onClick={handleConfirm} disabled={saving} className="btn-primary flex-1">{saving ? 'Processing...' : 'Place Order'}</button>
      </div>
    </div>
  )
}
