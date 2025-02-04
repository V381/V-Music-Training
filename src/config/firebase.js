import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { initializeAppCheck, ReCaptchaV3Provider, getToken } from 'firebase/app-check'

// Firebase Config
const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID
}

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()
const githubProvider = new GithubAuthProvider()
const db = getFirestore(app)

// ✅ App Check Setup
const siteKey = process.env.VUE_APP_RECAPTCHA_SITE_KEY
let appCheckInstance = null

const getAppCheck = async () => {
  if (!appCheckInstance) {
    if (!siteKey) {
      console.error('🚨 Missing reCAPTCHA site key')
      return null
    }

    try {
      appCheckInstance = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(siteKey),
        isTokenAutoRefreshEnabled: true
      })

      console.log('✅ App Check Initialized')
    } catch (error) {
      console.error('🚨 Error initializing App Check:', error)
      return null
    }
  }

  return appCheckInstance
}

// ✅ Ensure Firestore requests include App Check token
const ensureAppCheckToken = async () => {
  const appCheck = await getAppCheck()
  if (!appCheck) {
    console.error('🚨 App Check is not initialized')
    return null
  }

  try {
    const token = await getToken(appCheck, true) // Force refresh token
    console.log('🔥 App Check Token:', token.token || 'No token')
    return token.token
  } catch (error) {
    console.error('🚨 Failed to get App Check token:', error)
    return null
  }
}

// ✅ Enable Debug Token in Development Mode
if (process.env.NODE_ENV === 'development' && process.env.VUE_APP_FIREBASE_APPCHECK_DEBUG_TOKEN) {
  window.FIREBASE_APPCHECK_DEBUG_TOKEN = process.env.VUE_APP_FIREBASE_APPCHECK_DEBUG_TOKEN
}

// ✅ Export everything
export {
  app,
  auth,
  googleProvider,
  githubProvider,
  db,
  getAppCheck,
  ensureAppCheckToken
}
