import { getAppCheck } from '../config/firebase'

export const withAppCheck = async (operation) => {
  await getAppCheck()
  return operation()
}
