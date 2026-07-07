import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import OrderTicketItem from '../components/OrderTicketItem'
import OrderReceipt from '../components/OrderReceipt'
import { useAuth } from '../hooks/useAuth'
import { db, ref, onValue } from '../services/firebase'

export default function Orders() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    if (!user) return
    const ordersRef = ref(db, 'orders')
    const unsub = onValue(ordersRef, (snapshot) => {
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
    return () => unsub()
  }, [user])

  if (selectedOrder) return (
    <div className="min-h-screen bg-app-bg flex flex-col">
      <div className="p-4 flex items-center gap-3 border-b border-gray-200">
        <button onClick={() => setSelectedOrder(null)} className="text-midnight-blue text-xl">&#x2190;</button>
        <h1 className="text-midnight-blue font-bold text-lg">Order Details</h1>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <OrderReceipt order={selectedOrder} />
      </div>
    </div>
  )

  return (
    <div className="h-screen flex flex-col bg-app-bg">
      <div className="bg-midnight-blue text-white p-4 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate('/about')} className="text-white text-xl">&#x2190;</button>
        <h1 className="text-lg font-bold">My Orders</h1>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full"><span className="loading loading-spinner loading-lg text-midnight-blue"></span></div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <span className="text-6xl mb-4">📭</span>
            <p className="text-lg font-bold text-midnight-blue mb-2">No Orders Yet</p>
            <p className="text-sm mb-6 text-center">Locate a water station near you and place your first order!</p>
            <button onClick={() => navigate('/maps')} className="btn-primary">Find Water Stations</button>
          </div>
        ) : (
          orders.map((order) => (
            <OrderTicketItem key={order.firebaseKey} order={order} onClick={() => setSelectedOrder(order)} />
          ))
        )}
      </div>
      <BottomNav />
    </div>
  )
}
