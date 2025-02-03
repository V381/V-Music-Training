import { getToken } from 'firebase/app-check'
import { getAppCheck } from '../config/firebase'

export const withAppCheck = async (operation) => {
  try {
    const appCheck = await getAppCheck()

    if (!appCheck) {
      console.warn('AppCheck not available, proceeding without verification')
      return await operation()
    }

    // Use getToken function from firebase/app-check
    try {
      await getToken(appCheck, /* forceRefresh */ true)
    } catch (tokenError) {
      console.warn('Failed to get AppCheck token:', tokenError)
    }

    return await operation()
  } catch (error) {
    if (error.message?.includes('NS BINDING ABORTED')) {
      console.error('reCAPTCHA initialization failed:', error)
    } else {
      console.error('Operation failed:', error)
    }
    throw error
  }
}
