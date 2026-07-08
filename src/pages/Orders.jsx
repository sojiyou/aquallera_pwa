import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import OrderTicketItem from '../components/OrderTicketItem'
import OrderReceipt from '../components/OrderReceipt'
import { useAuth } from '../hooks/useAuth'
import { db, ref, onValue, update } from '../services/firebase'

export default function Orders() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [stationStatuses, setStationStatuses] = useState({})
  const [cancellingId, setCancellingId] = useState(null)

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
    } catch {}
    setCancellingId(null)
  }

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
              onClick={() => handleCancelOrder(selectedOrder)}
              disabled={cancellingId === selectedOrder.firebaseKey}
              className="w-full py-3 rounded-lg bg-red-500 text-white font-medium text-sm disabled:opacity-50"
            >{cancellingId === selectedOrder.firebaseKey ? 'Cancelling...' : 'Cancel Order'}</button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-dvh flex flex-col bg-app-bg">
      <div className="bg-midnight-blue text-white p-3 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate('/maps')} className="text-white text-xl">&#x2190;</button>
        <h1 className="text-lg font-bold">My Orders</h1>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full"><span className="loading loading-spinner loading-lg text-midnight-blue"></span></div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-lg font-bold text-midnight-blue mb-2">No Orders Yet</p>
            <p className="text-sm mb-6 text-center">Locate a water station near you and place your first order!</p>
            <button onClick={() => navigate('/maps')} className="btn-primary">Find Water Stations</button>
          </div>
        ) : (
          orders.map((order) => (
            <OrderTicketItem key={order.firebaseKey} order={order} revoked={isRevoked(order.stationId)} onClick={() => setSelectedOrder(order)} />
          ))
        )}
      </div>
      <BottomNav />
    </div>
  )
}