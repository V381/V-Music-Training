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

// Development debug token
if (process.env.NODE_ENV === 'development') {
  window.FIREBASE_APPCHECK_DEBUG_TOKEN = true
}

// Initialize App Check
let appCheckPromise = null
const getAppCheck = async () => {
  if (!appCheckPromise) {
    appCheckPromise = new Promise((resolve) => {
      const siteKey = process.env.VUE_APP_RECAPTCHA_SITE_KEY
      if (!siteKey) {
        console.error('Missing reCAPTCHA site key')
        resolve(null)
        return
      }
      try {
        const appCheck = initializeAppCheck(app, {
          provider: new ReCaptchaV3Provider(siteKey),
          isTokenAutoRefreshEnabled: true
        })
        // Return the AppCheck instance directly
        resolve(appCheck)
      } catch (error) {
        console.error('Error initializing App Check:', error)
        resolve(null)
      }
    })
  }
  // Return the resolved Promise value
  return await appCheckPromise
}

// Initialize App Check
getAppCheck()

export {
  app,
  auth,
  googleProvider,
  githubProvider,
  db,
  getAppCheck
}
