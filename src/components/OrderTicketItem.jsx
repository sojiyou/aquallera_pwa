const statusColors = {
  pending: '#eab308',
  confirmed: '#60a5fa',
  preparing: '#3b82f6',
  on_delivery: '#2563eb',
  ready: '#1d4ed8',
  delivered: '#22c55e',
  completed: '#22c55e',
  cancelled: '#ef4444',
}

const statusLabels = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  on_delivery: 'For Delivery',
  ready: 'For Pickup',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export default function OrderTicketItem({ order, revoked, onClick }) {
  const status = (order.status || 'pending').toLowerCase()
  const date = order.date || (order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A')
  const qty = [order.pureWaterQty, order.springWaterQty, order.mineralWaterQty].filter(Boolean).join(' + ') || 'N/A'

  return (
    <div
      onClick={onClick}
      className="bg-[#ECEFF1] rounded-xl p-4 mb-3 cursor-pointer active:scale-[0.98] transition-transform"
      role="button"
      tabIndex={0}
    >
      {revoked && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-2">
          <p className="text-red-700 text-xs font-medium">Station no longer active</p>
        </div>
      )}
      <h3 className="font-bold text-midnight-blue text-lg mb-1">{order.stationName || 'Unknown Station'}</h3>
      <span
        className="inline-block text-white text-xs px-2 py-0.5 rounded-full mb-2"
        style={{ backgroundColor: statusColors[status] || '#eab308' }}
      >
        {statusLabels[status] || order.status || 'Pending'}
      </span>
      <hr className="border-midnight-blue my-1" />
      <p className="text-midnight-blue text-sm">Date: {date}</p>
      <p className="text-midnight-blue text-sm">Ref #: {order.referenceNumber || 'N/A'}</p>
      <p className="text-midnight-blue text-sm">Items: {qty}</p>
      <p className="text-midnight-blue text-xl font-bold text-right mt-2">₱{(order.grandTotal || 0).toFixed(2)}</p>
    </div>
  )
}