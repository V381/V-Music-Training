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

const initializeAppCheckWithRetry = async () => {
  // Load reCAPTCHA script dynamically
  const loadRecaptchaScript = () => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.VUE_APP_RECAPTCHA_SITE_KEY}`
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  try {
    if (process.env.NODE_ENV === 'development') {
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = true
    }

    if (!window.grecaptcha) {
      await loadRecaptchaScript()
    }

    await new Promise((resolve) => {
      if (window.grecaptcha && window.grecaptcha.ready) {
        window.grecaptcha.ready(resolve)
      } else {
        window.onloadCallback = resolve
      }
    })

    // Initialize App Check
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(process.env.VUE_APP_RECAPTCHA_SITE_KEY),
      isTokenAutoRefreshEnabled: true
    })

    console.log('App Check initialized successfully')
  } catch (error) {
    console.error('App Check initialization error:', error)
    setTimeout(initializeAppCheckWithRetry, 5000)
  }
}

// Start initialization
if (document.readyState === 'complete') {
  initializeAppCheckWithRetry()
} else {
  window.addEventListener('load', initializeAppCheckWithRetry)
}

export { app, auth, googleProvider, githubProvider, db, appCheck }
