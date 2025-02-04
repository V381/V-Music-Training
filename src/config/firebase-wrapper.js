import { getAppCheck } from '../config/firebase'
import { getToken } from 'firebase/app-check'

export const withAppCheck = async (operation) => {
  try {
    const appCheck = await getAppCheck()

    if (!appCheck) {
      console.error('AppCheck initialization failed')
      throw new Error('AppCheck initialization failed')
    }

    let token
    try {
      setTimeout(async () => {
        token = await getToken(appCheck, true)
      }, 100)
      console.log('App Check Token:', token.token || 'No token')
    } catch (tokenError) {
      console.error('Token error:', tokenError)
      throw tokenError
    }

    if (!token || !token.token) {
      console.error('No AppCheck token obtained')
      throw new Error('No AppCheck token available')
    }

    return await operation()
  } catch (error) {
    console.error('Operation failed:', error)
    throw error
  }
}
