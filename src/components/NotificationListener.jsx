import { useEffect, useRef } from 'react'
import { db, ref, onValue, off } from '../services/firebase'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

function shortenRef(refStr) {
  const parts = refStr.split('-')
  if (parts.length === 3 && parts[2].length === 4) {
    return `${parts[0]}-...-${parts[2]}`
  }
  return refStr.length > 10 ? `...${refStr.slice(-4)}` : refStr
}

function normalizeStatus(status) {
  if (!status) return ''
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
}

export default function NotificationListener() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const stationPrev = useRef({})
  const orderPrev = useRef({})
  const stationInit = useRef(true)
  const orderInit = useRef(true)

  useEffect(() => {
    if (!user) return

    const stationsRef = ref(db, 'waterStations')
    const unsubStations = onValue(stationsRef, (snapshot) => {
      const data = snapshot.val()
      if (!data) return

      Object.entries(data).forEach(([id, station]) => {
        const online = station.isOnline || station.online || false
        const was = stationPrev.current[id]

        if (!stationInit.current && was === false && online === true) {
          addToast(`${station.stationName || 'A station'} is now online.`)
        }

        stationPrev.current[id] = online
      })

      stationInit.current = false
    })

    const ordersRef = ref(db, 'orders')
    const unsubOrders = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val()
      if (!data) return

      Object.entries(data).forEach(([key, order]) => {
        if (order.userId !== user.uid && order.customerId !== user.uid) return

        const current = order.status || ''
        const previous = orderPrev.current[key]

        if (!orderInit.current && previous && previous !== current) {
          const short = shortenRef(order.referenceNumber || order.orderId || key)
          addToast(`Order ${short} updated to ${normalizeStatus(current)}.`)
        }

        orderPrev.current[key] = current
      })

      orderInit.current = false
    })

    return () => {
      unsubStations()
      unsubOrders()
    }
  }, [user])

  return null
}
