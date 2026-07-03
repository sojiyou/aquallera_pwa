import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getDatabase, ref, child, get, set, push, update, remove, query, orderByChild, equalTo, onValue, off, runTransaction, serverTimestamp } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getDatabase(app)

function getStationPrefix(stationName) {
  return (stationName || 'WTR').replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || 'WTR'
}

function generateReferenceNumber(stationName) {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const dateStr = `${y}${m}${d}`
  const prefix = getStationPrefix(stationName)
  const counterRef = ref(db, `orderCounter/${dateStr}`)

  return runTransaction(counterRef, (current) => (current || 0) + 1)
    .then((result) => {
      const count = result.snapshot.val() || 1
      const padded = String(count).padStart(4, '0')
      return `${prefix}-${dateStr}-${padded}`
    })
    .catch(() => `${prefix}-${dateStr}-0000`)
}

export {
  auth,
  db,
  ref,
  child,
  get,
  set,
  push,
  update,
  remove,
  query,
  orderByChild,
  equalTo,
  onValue,
  off,
  runTransaction,
  serverTimestamp,
  onAuthStateChanged,
  generateReferenceNumber,
}
