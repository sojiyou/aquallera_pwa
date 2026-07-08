import { useLocation, useNavigate } from 'react-router-dom'
import { sendOrderConfirmationEmail } from '../services/emailjs'
import { db, ref, set, generateReferenceNumber } from '../services/firebase'
import { useState } from 'react'
import OrderReceipt from '../components/OrderReceipt'

export default function OrderConfirmation() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const orderData = state?.orderData

  if (!orderData) return (
    <div className="h-dvh flex flex-col items-center justify-center bg-app-bg gap-4">
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
    <div className="min-h-dvh bg-app-bg flex flex-col">
      <div className="p-4 flex items-center gap-3 border-b border-gray-200">
        <button onClick={() => navigate(-1)} className="text-midnight-blue text-xl">&#x2190;</button>
        <h1 className="text-midnight-blue font-bold text-lg">Confirm Order</h1>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <OrderReceipt order={orderData} />
      </div>

      <div className="p-4 flex gap-3">
        <button onClick={() => navigate(-1)} className="btn-secondary flex-1" disabled={saving}>Edit Order</button>
        <button onClick={handleConfirm} disabled={saving} className="btn-primary flex-1">{saving ? 'Processing...' : 'Place Order'}</button>
      </div>
    </div>
  )
}
