import { getToken } from 'firebase/app-check'
import { getAppCheck } from '../config/firebase'

export const withAppCheck = async (operation) => {
  try {
    const appCheck = await getAppCheck()

    if (!appCheck) {
      console.error('AppCheck initialization failed')
      throw new Error('AppCheck initialization failed')
    }

    let token
    try {
      // Get token with force refresh
      token = await getToken(appCheck, true)
      console.log(appCheck)
      console.log('Successfully obtained AppCheck token:',
        token ? 'Token present' : 'No token')
    } catch (tokenError) {
      console.error('Token error:', tokenError)
      throw tokenError
    }

    if (!token) {
      console.error('No token obtained from AppCheck')
      throw new Error('No AppCheck token available')
    }

    // Execute operation with token available
    const result = await operation()
    return result
  } catch (error) {
    console.error('Operation failed:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    })

    if (error.message?.includes('Missing or insufficient permissions')) {
      console.error('Permission denied. Verify security rules and token.')
    }

    throw error
  }
}
