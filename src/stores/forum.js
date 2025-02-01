import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db, auth } from '../config/firebase'
import { enhancedDb } from '../utils/db'

export const useForumStore = defineStore('forum', () => {
  const posts = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const userLikes = ref(new Map())

  const createPost = async (postData) => {
    if (!auth.currentUser) throw new Error('Must be logged in')

    try {
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

      const docRef = await enhancedDb.addDoc(enhancedDb.collection(db, 'forum_posts'), post)
      return docRef.id
    } catch (err) {
      console.error('Error creating post:', err)
      throw err
    }
  }

  const fetchPosts = async (filters = {}) => {
    isLoading.value = true
    error.value = null

    try {
      let q = enhancedDb.collection(db, 'forum_posts')

      if (filters.tag) {
        q = enhancedDb.query(q, enhancedDb.where('tags', 'array-contains', filters.tag))
      }

      if (filters.userId) {
        q = enhancedDb.query(q, enhancedDb.where('userId', '==', filters.userId))
      }

      q = enhancedDb.query(q, enhancedDb.orderBy('createdAt', 'desc'))

      const snapshot = await enhancedDb.getDocs(q)
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
    try {
      const comment = {
        content: commentData.content,
        userId: auth.currentUser.uid,
        postId,
        createdAt: new Date(),
        userName: auth.currentUser.displayName || 'Anonymous',
        userPhotoURL: auth.currentUser.photoURL || null
      }

      await enhancedDb.addDoc(enhancedDb.collection(db, 'forum_comments'), comment)
      const postRef = enhancedDb.doc(db, 'forum_posts', postId)
      await enhancedDb.updateDoc(postRef, {
        comments: enhancedDb.increment(1)
      })

      // Update local post data
      const postIndex = posts.value.findIndex(p => p.id === postId)
      if (postIndex !== -1) {
        posts.value[postIndex].comments++
      }
    } catch (err) {
      console.error('Error adding comment:', err)
      throw err
    }
  }

  const fetchComments = async (postId) => {
    try {
      const q = enhancedDb.query(
        enhancedDb.collection(db, 'forum_comments'),
        enhancedDb.where('postId', '==', postId),
        enhancedDb.orderBy('createdAt', 'asc')
      )
      const snapshot = await enhancedDb.getDocs(q)
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
    try {
      const postRef = enhancedDb.doc(db, 'forum_posts', postId)
      const postDoc = await enhancedDb.getDoc(postRef)
      if (postDoc.data().userId !== auth.currentUser.uid) {
        throw new Error('Not authorized to delete this post')
      }
      await enhancedDb.deleteDoc(postRef)
      posts.value = posts.value.filter(p => p.id !== postId)
    } catch (err) {
      console.error('Error deleting post:', err)
      throw err
    }
  }

  const deleteComment = async (commentId) => {
    if (!auth.currentUser) throw new Error('Must be logged in')
    try {
      const commentRef = enhancedDb.doc(db, 'forum_comments', commentId)
      const commentDoc = await enhancedDb.getDoc(commentRef)
      if (!commentDoc.exists()) {
        throw new Error('Comment not found')
      }
      if (commentDoc.data().userId !== auth.currentUser.uid) {
        throw new Error('Not authorized to delete this comment')
      }
      await enhancedDb.deleteDoc(commentRef)

      const postId = commentDoc.data().postId
      const postRef = enhancedDb.doc(db, 'forum_posts', postId)
      await enhancedDb.updateDoc(postRef, {
        comments: enhancedDb.increment(-1)
      })

      // Update local post data
      const postIndex = posts.value.findIndex(p => p.id === postId)
      if (postIndex !== -1) {
        posts.value[postIndex].comments--
      }
    } catch (err) {
      console.error('Error deleting comment:', err)
      throw err
    }
  }

  const fetchUserLikes = async () => {
    if (!auth.currentUser) return
    try {
      const q = enhancedDb.query(
        enhancedDb.collection(db, 'post_likes'),
        enhancedDb.where('userId', '==', auth.currentUser.uid)
      )
      const snapshot = await enhancedDb.getDocs(q)
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
    try {
      const isLiked = userLikes.value.has(postId)
      const postRef = enhancedDb.doc(db, 'forum_posts', postId)

      if (isLiked) {
        // Remove like
        const likeId = userLikes.value.get(postId)
        await enhancedDb.deleteDoc(enhancedDb.doc(db, 'post_likes', likeId))
        userLikes.value.delete(postId)
        await enhancedDb.updateDoc(postRef, { likes: enhancedDb.increment(-1) })
      } else {
        // Add like
        const likeDoc = await enhancedDb.addDoc(enhancedDb.collection(db, 'post_likes'), {
          postId,
          userId: auth.currentUser.uid,
          createdAt: new Date()
        })
        userLikes.value.set(postId, likeDoc.id)
        await enhancedDb.updateDoc(postRef, { likes: enhancedDb.increment(1) })
      }

      // Update local post data
      const postIndex = posts.value.findIndex(p => p.id === postId)
      if (postIndex !== -1) {
        posts.value[postIndex].likes += isLiked ? -1 : 1
      }
    } catch (err) {
      console.error('Error toggling like:', err)
      throw err
    }
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
