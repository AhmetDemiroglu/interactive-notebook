import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyD8xPBrpT0BwewSchq6zE0YjYkaNbL-FSw",
  authDomain: "interactive-notebook-4b92a.firebaseapp.com",
  databaseURL: "https://interactive-notebook-4b92a-default-rtdb.firebaseio.com",
  projectId: "interactive-notebook-4b92a",
  storageBucket: "interactive-notebook-4b92a.firebasestorage.app",
  messagingSenderId: "301395283202",
  appId: "1:301395283202:web:1332b717e20843c96e061b",
  measurementId: "G-XR2FC8QH8L"
};

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)
const auth = getAuth(app)

export { db, auth } 