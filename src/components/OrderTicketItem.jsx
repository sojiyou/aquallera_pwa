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

const cancellable = (status) => ['pending', 'confirmed'].includes(status)

export default function OrderTicketItem({ order, revoked, onCancel, cancelling, onClick }) {
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
      <div className="flex items-start justify-between mb-1">
        <h3 className="font-bold text-midnight-blue text-lg">{order.stationName || 'Unknown Station'}</h3>
        {cancellable(status) && (
          <button
            onClick={(e) => { e.stopPropagation(); onCancel?.() }}
            disabled={cancelling}
            className="text-xs text-red-600 font-medium underline shrink-0 ml-2 disabled:opacity-50"
          >{cancelling ? 'Cancelling...' : 'Cancel'}</button>
        )}
      </div>
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