import { to12Hour } from '../utils/formatTime'

export default function OrderReceipt({ order, revoked }) {
  const lineItems = [
    ...(order.pureWaterQty > 0 ? [{ name: 'Pure Water', qty: order.pureWaterQty, total: order.pureWaterTotal }] : []),
    ...(order.springWaterQty > 0 ? [{ name: 'Spring Water', qty: order.springWaterQty, total: order.springWaterTotal }] : []),
    ...(order.mineralWaterQty > 0 ? [{ name: 'Mineral Water', qty: order.mineralWaterQty, total: order.mineralWaterTotal }] : []),
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 max-w-md mx-auto">
      {revoked && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-700 text-sm font-medium">Station No Longer Active</p>
          <p className="text-red-600 text-xs mt-1">The water station for this order has been revoked. Please contact support for assistance.</p>
        </div>
      )}
      <div className="text-center border-b border-dashed border-gray-300 pb-4 mb-4">
        <h2 className="text-midnight-blue font-bold text-xl">AQUA-LLERA</h2>
        <p className="text-xs text-gray-400">Order Receipt</p>
        <p className="text-sm text-gray-600 mt-2"><strong>{order.stationName || order.station_name || 'Unknown Station'}</strong></p>
        {order.referenceNumber && <p className="text-xs text-gray-400 mt-1">Ref: {order.referenceNumber}</p>}
        <span className="inline-block mt-1 text-xs bg-blue-50 text-midnight-blue px-3 py-0.5 rounded-full font-medium">{order.orderType || order.order_type || 'N/A'}</span>
      </div>

      {(order.orderType || order.order_type || '').toLowerCase() === 'delivery' && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-gray-600 mb-4">
          <strong>Note:</strong> Please have your empty water gallons ready for pickup when the
          delivery truck arrives. Delivered gallons are swapped one-for-one with your empty ones —
          any gallon not returned will be charged.
        </div>
      )}

      <div className="space-y-3 mb-4 pb-4 border-b border-dashed border-gray-300">
        <div className="flex justify-between text-xs text-gray-500 font-medium uppercase tracking-wide">
          <span className="flex-[2]">Item</span>
          <span className="w-16 text-center">Qty</span>
          <span className="w-20 text-right">Amount</span>
        </div>
        {lineItems.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="flex-[2] text-gray-700">{item.name}</span>
            <span className="w-16 text-center text-gray-600">{item.qty}</span>
            <span className="w-20 text-right text-gray-800 font-medium">₱{item.total.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="text-sm space-y-1.5 mb-4 pb-4 border-b border-dashed border-gray-300">
        <div className="flex justify-between">
          <span className="text-gray-500">Subtotal</span>
          <span className="text-gray-700">₱{(order.waterSubtotal || order.water_subtotal || 0).toFixed(2)}</span>
        </div>
        {(order.deliveryFee || order.delivery_fee) > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-500">Delivery Fee</span>
            <span className="text-gray-700">₱{(order.deliveryFee || order.delivery_fee || 0).toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-500">Transaction Fee</span>
          <span className="text-gray-700">₱{(order.transactionFee || order.transaction_fee || 5).toFixed(2)}</span>
        </div>
      </div>

      <div className="flex justify-between text-base font-bold text-midnight-blue mb-4">
        <span>Total</span>
        <span>₱{(order.grandTotal || order.grand_total || 0).toFixed(2)}</span>
      </div>

      <div className="text-xs text-gray-400 space-y-1 border-t border-dashed border-gray-200 pt-4">
        {order.customerName && (
          <div className="flex justify-between">
            <span>Customer</span>
            <span className="text-gray-600 text-right max-w-[60%]">{order.customerName}</span>
          </div>
        )}
        {order.customerPhone && (
          <div className="flex justify-between">
            <span>Contact</span>
            <span className="text-gray-600">{order.customerPhone}</span>
          </div>
        )}
        {(order.locationDetails || order.deliveryAddress) && (
          <div className="flex justify-between">
            <span>Address</span>
            <span className="text-gray-600 text-right max-w-[60%]">{order.locationDetails || order.deliveryAddress}</span>
          </div>
        )}
        {order.paymentMethod && (
          <div className="flex justify-between">
            <span>Payment</span>
            <span className="text-gray-600">{order.paymentMethod}</span>
          </div>
        )}
        {order.date && (
          <div className="flex justify-between">
            <span>Date</span>
            <span className="text-gray-600">{order.date}</span>
          </div>
        )}
        {order.time && (
          <div className="flex justify-between">
            <span>Time</span>
            <span className="text-gray-600">{to12Hour(order.time)}</span>
          </div>
        )}
        {order.additionalDetails && (
          <div className="flex justify-between">
            <span>Notes</span>
            <span className="text-gray-600 text-right max-w-[60%]">{order.additionalDetails}</span>
          </div>
        )}
      </div>
    </div>
  )
}
