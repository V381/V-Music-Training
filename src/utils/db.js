import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDoc,
  increment,
  serverTimestamp
} from 'firebase/firestore'
import { getAppCheck } from '../config/firebase'

export const enhancedDb = {
  async addDoc (collectionRef, data) {
    await getAppCheck()
    return addDoc(collectionRef, data)
  },

  async getDocs (query) {
    await getAppCheck()
    return getDocs(query)
  },

  async getDoc (docRef) {
    await getAppCheck()
    return getDoc(docRef)
  },

  async updateDoc (docRef, data) {
    await getAppCheck()
    return updateDoc(docRef, data)
  },

  async deleteDoc (docRef) {
    await getAppCheck()
    return deleteDoc(docRef)
  },

  collection,
  doc,
  query,
  where,
  orderBy,
  increment,
  serverTimestamp
}
