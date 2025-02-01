import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'

const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()
const githubProvider = new GithubAuthProvider()
const db = getFirestore(app)

let appCheck = null
let appCheckInitialized = false

// For development mode
if (process.env.NODE_ENV === 'development') {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true
}

// Function to initialize App Check
const initializeAppCheckAsync = async () => {
  if (appCheckInitialized) return appCheck

  return new Promise((resolve, reject) => {
    try {
      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(process.env.VUE_APP_RECAPTCHA_SITE_KEY),
        isTokenAutoRefreshEnabled: true
      })
      appCheckInitialized = true
      console.log('App Check initialized successfully')
      resolve(appCheck)
    } catch (error) {
      console.error('App Check initialization error:', error)
      reject(error)
    }
  })
}

// Initialize App Check
initializeAppCheckAsync()

export { app, auth, googleProvider, githubProvider, db, appCheck, initializeAppCheckAsync }
