import { getAppCheck } from '../config/firebase'

export const withAppCheck = async (operation) => {
  try {
    // Get AppCheck instance
    const appCheck = await getAppCheck()

    if (!appCheck) {
      console.warn('AppCheck not available, proceeding without verification')
      return await operation()
    }

    // Wait for token refresh
    try {
      await appCheck.getToken(true)
    } catch (tokenError) {
      console.warn('Failed to get AppCheck token:', tokenError)
      // Proceed with operation even if token refresh fails
    }

    // Execute the operation
    return await operation()
  } catch (error) {
    // If it's an AppCheck-related error, log it specially
    if (error.message?.includes('NS BINDING ABORTED')) {
      console.error('reCAPTCHA initialization failed:', error)
    } else {
      console.error('Operation failed:', error)
    }
    throw error
  }
}
