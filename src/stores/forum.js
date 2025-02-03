import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db, auth } from '../config/firebase'
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  increment,
  getDoc
} from 'firebase/firestore'
import { withAppCheck } from '@/config/firebase-wrapper'

export const useForumStore = defineStore('forum', () => {
  const posts = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const userLikes = ref(new Map())

  const createPost = async (postData) => {
    if (!auth.currentUser) throw new Error('Must be logged in')

    return withAppCheck(async () => {
      const post = {
        title: postData.title,
        content: postData.content,
        userId: auth.currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        likes: 0,
        comments: 0,
        tags: postData.tags || [],
        userName: auth.currentUser.displayName || 'Anonymous',
        userPhotoURL: auth.currentUser.photoURL || null
      }

      const docRef = await addDoc(collection(db, 'forum_posts'), post)
      return docRef.id
    })
  }

  const fetchPosts = async (filters = {}) => {
    isLoading.value = true
    error.value = null

    try {
      let q = collection(db, 'forum_posts')

      if (filters.tag) {
        q = query(q, where('tags', 'array-contains', filters.tag))
      }

      if (filters.userId) {
        q = query(q, where('userId', '==', filters.userId))
      }

      q = query(q, orderBy('createdAt', 'desc'))

      const snapshot = await getDocs(q)
      posts.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      }))

      await fetchUserLikes()
    } catch (err) {
      console.error('Error fetching posts:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const addComment = async (postId, commentData) => {
    if (!auth.currentUser) throw new Error('Must be logged in')

    return withAppCheck(async () => {
      const comment = {
        content: commentData.content,
        userId: auth.currentUser.uid,
        postId,
        createdAt: new Date(),
        userName: auth.currentUser.displayName || 'Anonymous',
        userPhotoURL: auth.currentUser.photoURL || null
      }

      const commentRef = await addDoc(collection(db, 'forum_comments'), comment)

      const postRef = doc(db, 'forum_posts', postId)
      await updateDoc(postRef, {
        comments: increment(1)
      })

      // Update local post data
      const postIndex = posts.value.findIndex(p => p.id === postId)
      if (postIndex !== -1) {
        posts.value[postIndex].comments++
      }

      return commentRef.id
    })
  }

  const fetchComments = async (postId) => {
    try {
      const q = query(
        collection(db, 'forum_comments'),
        where('postId', '==', postId),
        orderBy('createdAt', 'asc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }))
    } catch (err) {
      console.error('Error fetching comments:', err)
      throw err
    }
  }

  const deletePost = async (postId) => {
    if (!auth.currentUser) throw new Error('Must be logged in')

    return withAppCheck(async () => {
      const postRef = doc(db, 'forum_posts', postId)
      const postDoc = await getDoc(postRef)

      if (postDoc.data().userId !== auth.currentUser.uid) {
        throw new Error('Not authorized to delete this post')
      }

      await deleteDoc(postRef)
      posts.value = posts.value.filter(p => p.id !== postId)
    })
  }

  const deleteComment = async (commentId) => {
    if (!auth.currentUser) throw new Error('Must be logged in')

    return withAppCheck(async () => {
      const commentRef = doc(db, 'forum_comments', commentId)
      const commentDoc = await getDoc(commentRef)

      if (!commentDoc.exists()) {
        throw new Error('Comment not found')
      }

      if (commentDoc.data().userId !== auth.currentUser.uid) {
        throw new Error('Not authorized to delete this comment')
      }

      await deleteDoc(commentRef)

      const postId = commentDoc.data().postId
      const postRef = doc(db, 'forum_posts', postId)
      await updateDoc(postRef, {
        comments: increment(-1)
      })

      // Update local post data
      const postIndex = posts.value.findIndex(p => p.id === postId)
      if (postIndex !== -1) {
        posts.value[postIndex].comments--
      }
    })
  }

  const fetchUserLikes = async () => {
    if (!auth.currentUser) return

    try {
      const q = query(
        collection(db, 'post_likes'),
        where('userId', '==', auth.currentUser.uid)
      )
      const snapshot = await getDocs(q)
      userLikes.value.clear()
      snapshot.docs.forEach(doc => {
        userLikes.value.set(doc.data().postId, doc.id)
      })
    } catch (err) {
      console.error('Error fetching user likes:', err)
    }
  }

  const isPostLiked = (postId) => {
    return userLikes.value.has(postId)
  }

  const likePost = async (postId) => {
    if (!auth.currentUser) throw new Error('Must be logged in')

    return withAppCheck(async () => {
      const isLiked = userLikes.value.has(postId)
      const postRef = doc(db, 'forum_posts', postId)

      if (isLiked) {
        // Remove like
        const likeId = userLikes.value.get(postId)
        await deleteDoc(doc(db, 'post_likes', likeId))
        userLikes.value.delete(postId)
        await updateDoc(postRef, { likes: increment(-1) })
      } else {
        // Add like
        const likeDoc = await addDoc(collection(db, 'post_likes'), {
          postId,
          userId: auth.currentUser.uid,
          createdAt: new Date()
        })
        userLikes.value.set(postId, likeDoc.id)
        await updateDoc(postRef, { likes: increment(1) })
      }

      // Update local post data
      const postIndex = posts.value.findIndex(p => p.id === postId)
      if (postIndex !== -1) {
        posts.value[postIndex].likes += isLiked ? -1 : 1
      }
    })
  }

  return {
    posts,
    isLoading,
    error,
    userLikes,
    createPost,
    fetchPosts,
    addComment,
    fetchComments,
    deletePost,
    deleteComment,
    fetchUserLikes,
    isPostLiked,
    likePost
  }
})
