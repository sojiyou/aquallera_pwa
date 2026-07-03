const statusColors = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-blue-500',
  preparing: 'bg-indigo-500',
  on_delivery: 'bg-orange-500',
  ready: 'bg-teal-500',
  delivered: 'bg-green-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
}

export default function OrderTicketItem({ order, onClick }) {
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
      <h3 className="font-bold text-midnight-blue text-lg mb-1">{order.stationName || 'Unknown Station'}</h3>
      <span className={`inline-block text-white text-xs px-2 py-0.5 rounded-full mb-2 ${statusColors[status] || 'bg-yellow-500'}`}>
        {order.status || 'Pending'}
      </span>
      <hr className="border-midnight-blue my-1" />
      <p className="text-midnight-blue text-sm">Date: {date}</p>
      <p className="text-midnight-blue text-sm">Ref #: {order.referenceNumber || 'N/A'}</p>
      <p className="text-midnight-blue text-sm">Items: {qty}</p>
      <p className="text-midnight-blue text-xl font-bold text-right mt-2">₱{(order.grandTotal || 0).toFixed(2)}</p>
    </div>
  )
}
