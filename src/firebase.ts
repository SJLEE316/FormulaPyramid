import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCP5VqTiTYpsIzYVO91cD8ePVSyRjkvcug',
  authDomain: 'formulapyramid-c14e1.firebaseapp.com',
  projectId: 'formulapyramid-c14e1',
  storageBucket: 'formulapyramid-c14e1.firebasestorage.app',
  messagingSenderId: '355220924379',
  appId: '1:355220924379:web:7a464e5ec880c8bae669fe',
  measurementId: 'G-E1QQXR33PF',
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
