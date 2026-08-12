import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import OrderTicketItem from '../components/OrderTicketItem'
import OrderReceipt from '../components/OrderReceipt'
import { useAuth } from '../hooks/useAuth'
import { db, ref, onValue, update } from '../services/firebase'

const PAGE_SIZE = 5

const filterTabs = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'on_delivery', label: 'On Delivery' },
  { value: 'ready', label: 'Ready' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function Orders() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [stationStatuses, setStationStatuses] = useState({})
  const [cancellingId, setCancellingId] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [filterStatus])

  useEffect(() => {
    if (!user) return
    const stationsRef = ref(db, 'waterStations')
    const unsubStations = onValue(stationsRef, (snapshot) => {
      const map = {}
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const data = child.val()
          map[child.key] = { status: data.status || null, revokedAt: data.revokedAt || null }
        })
      }
      setStationStatuses(map)
    })
    return () => unsubStations()
  }, [user])

  useEffect(() => {
    if (!user) return
    const ordersRef = ref(db, 'orders')
    const unsubOrders = onValue(ordersRef, (snapshot) => {
      const list = []
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const o = child.val()
          if (o.userId === user.uid) {
            list.push({ firebaseKey: child.key, ...o })
          }
        })
      }
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      setOrders(list)
      setLoading(false)
    })
    return () => unsubOrders()
  }, [user])

  const isRevoked = (stationId) => {
    const s = stationStatuses[stationId]
    if (!s) return false
    return s.status === 'deletion_pending' || s.revokedAt
  }

  useEffect(() => {
    const toCancel = orders.filter((o) => {
      const s = (o.status || '').toLowerCase()
      return isRevoked(o.stationId) && (s === 'pending' || s === 'confirmed')
    })
    toCancel.forEach((o) => {
      update(ref(db, `orders/${o.firebaseKey}`), {
        status: 'cancelled',
        cancellationReason: 'Station no longer active',
        updatedAt: new Date().toISOString()
      })
    })
  }, [orders, stationStatuses])

  const handleCancelOrder = async (order) => {
    setCancellingId(order.firebaseKey)
    try {
      await update(ref(db, `orders/${order.firebaseKey}`), {
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      })
      setSelectedOrder({ ...order, status: 'cancelled', updatedAt: new Date().toISOString() })
    } catch {}
    setCancellingId(null)
    setShowCancelModal(false)
  }

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter((o) => (o.status || '').toLowerCase() === filterStatus)
  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE)
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  if (selectedOrder) {
    const selStatus = (selectedOrder.status || '').toLowerCase()
    const canCancel = selStatus === 'pending' || selStatus === 'confirmed'
    return (
      <div className="min-h-dvh bg-app-bg flex flex-col">
        <div className="p-4 flex items-center gap-3 border-b border-gray-200">
          <button onClick={() => setSelectedOrder(null)} className="text-midnight-blue text-xl">&#x2190;</button>
          <h1 className="text-midnight-blue font-bold text-lg">Order Details</h1>
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          <OrderReceipt order={selectedOrder} revoked={isRevoked(selectedOrder.stationId)} />
          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={cancellingId === selectedOrder.firebaseKey}
              className="w-full py-3 rounded-lg bg-red-500 text-white font-medium text-sm disabled:opacity-50"
            >{cancellingId === selectedOrder.firebaseKey ? 'Cancelling...' : 'Cancel Order'}</button>
          )}
        </div>

        {showCancelModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowCancelModal(false)}>
            <div className="bg-white rounded-2xl p-5 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-red-700 font-bold text-lg mb-3">Cancel Order</h2>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to cancel this order? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowCancelModal(false)} disabled={!!cancellingId} className="btn-secondary flex-1">Keep Order</button>
                <button
                  onClick={() => handleCancelOrder(selectedOrder)}
                  disabled={!!cancellingId}
                  className="flex-1 py-2.5 rounded-lg font-medium text-sm bg-red-500 text-white disabled:opacity-50"
                >{cancellingId === selectedOrder.firebaseKey ? 'Cancelling...' : 'Cancel Order'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-dvh flex flex-col bg-app-bg">
      <div className="bg-midnight-blue text-white p-3 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate('/maps')} className="text-white text-xl">&#x2190;</button>
        <h1 className="text-lg font-bold">My Orders</h1>
      </div>
      {!loading && orders.length > 0 && (
        <div className="flex gap-1.5 px-4 py-2 overflow-x-auto shrink-0 [&::-webkit-scrollbar]:hidden">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterStatus === tab.value
                  ? 'bg-midnight-blue text-white'
                  : 'bg-input-bg text-gray-600'
              }`}
            >{tab.label}</button>
          ))}
        </div>
      )}
      <div className="flex-1 px-6 py-5 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full"><span className="loading loading-spinner loading-lg text-midnight-blue"></span></div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-lg font-bold text-midnight-blue mb-2">No Orders Yet</p>
            <p className="text-sm mb-6 text-center">Locate a water station near you and place your first order!</p>
            <button onClick={() => navigate('/maps')} className="btn-primary">Find Water Stations</button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-lg font-bold text-midnight-blue mb-2">No {filterTabs.find(t => t.value === filterStatus)?.label || ''} Orders</p>
            <p className="text-sm text-center">No orders match this status.</p>
          </div>
        ) : (
          <>
            {paginatedOrders.map((order) => (
              <OrderTicketItem key={order.firebaseKey} order={order} revoked={isRevoked(order.stationId)} onClick={() => setSelectedOrder(order)} />
            ))}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 pt-2 pb-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-midnight-blue text-white text-xs font-medium disabled:opacity-40"
                >Previous</button>
                <span className="text-xs text-gray-600">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-midnight-blue text-white text-xs font-medium disabled:opacity-40"
                >Next</button>
              </div>
            )}
          </>
        )}
      </div>
      <BottomNav />
    </div>
  )
}