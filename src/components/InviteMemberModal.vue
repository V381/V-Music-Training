<template>
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Invite Members to {{ group.name }}</h3>
          <button class="close-btn" @click="$emit('close')">×</button>
        </div>

        <form @submit.prevent="handleSubmit" class="invite-form">
          <div class="current-members">
            <h4>Current Members</h4>
            <div class="members-list">
              <div v-for="member in group.memberDetails" :key="member.id" class="member-item">
                <img :src="member.photoURL || '/default-avatar.png'" :alt="member.displayName" class="member-avatar">
                <span class="member-name">{{ member.displayName }}</span>
                <span class="member-role">{{ member.id === group.createdBy ? 'Admin' : 'Member' }}</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Email Address</label>
            <div class="email-input-wrapper">
              <input
                v-model="email"
                type="email"
                required
                placeholder="Enter email address"
                :disabled="isSubmitting"
              >
              <button
                type="submit"
                class="btn primary"
                :disabled="isSubmitting || !email"
              >
                {{ isSubmitting ? 'Sending...' : 'Send Invite' }}
              </button>
            </div>
            <p v-if="userNotFoundError" class="error-message">
             User with email {{ lastCheckedEmail }} not found
            </p>
          </div>

          <div v-if="pendingInvites.length" class="pending-invites">
            <h4>Pending Invites</h4>
            <div class="invites-list">
              <div v-for="invite in pendingInvites" :key="invite.id" class="invite-item">
                <span class="invite-email">{{ invite.email }}</span>
                <span class="invite-date">Sent {{ formatDate(invite.createdAt) }}</span>
                <button
                  class="btn small danger"
                  @click="cancelInvite(invite.id)"
                  :disabled="isSubmitting"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </template>

<script setup>
import { ref, onMounted, defineProps, defineEmits } from 'vue'
import { useGroupStore } from '../stores/groups'
import { useNotificationStore } from '../stores/notification'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { db, auth } from '../config/firebase'

const props = defineProps({
  group: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'invited'])
const groupStore = useGroupStore()
const notificationStore = useNotificationStore()

const email = ref('')
const lastCheckedEmail = ref('')
const isSubmitting = ref(false)
const pendingInvites = ref([])
const userNotFoundError = ref(false)

const handleSubmit = async () => {
  if (isSubmitting.value) return
  userNotFoundError.value = false
  try {
    isSubmitting.value = true
    lastCheckedEmail.value = email.value
    const userQuery = query(
      collection(db, 'users'),
      where('email', '==', email.value)
    )
    const userSnapshot = await getDocs(userQuery)

    if (userSnapshot.empty) {
      userNotFoundError.value = true
      return
    }

    await groupStore.inviteMember(props.group.id, email.value)
    notificationStore.addNotification('Invitation sent successfully', 'success')
    email.value = ''
    await fetchPendingInvites()
    emit('invited')
  } catch (err) {
    notificationStore.addNotification('Failed to send invitation', 'error')
    console.error('Error sending invite:', err)
  } finally {
    isSubmitting.value = false
  }
}

const fetchPendingInvites = async () => {
  if (!auth.currentUser) return []

  try {
    // Query invites where the email matches the current user's email
    const q = query(
      collection(db, 'group_invites'),
      where('email', '==', auth.currentUser.email),
      where('status', '==', 'pending')
    )

    const snapshot = await getDocs(q)

    // Get group details and sender details for each invite
    const invitesWithDetails = await Promise.all(
      snapshot.docs.map(async (inviteDoc) => {
        const inviteData = inviteDoc.data()

        try {
          // Get group details
          const groupRef = doc(db, 'practice_groups', inviteData.groupId)
          const groupDoc = await getDoc(groupRef)

          // Get sender details
          const senderRef = doc(db, 'users', inviteData.createdBy)
          const senderDoc = await getDoc(senderRef)

          return {
            id: inviteDoc.id,
            ...inviteData,
            group: groupDoc.exists() ? { id: groupDoc.id, ...groupDoc.data() } : null,
            sender: senderDoc.exists() ? senderDoc.data().displayName || 'Unknown User' : 'Unknown User'
          }
        } catch (err) {
          console.error('Error fetching details for invite:', inviteDoc.id, err)
          return null
        }
      })
    )

    // Filter out any failed fetches and invites for deleted groups
    return invitesWithDetails.filter(invite => invite && invite.group)
  } catch (err) {
    console.error('Error fetching invites:', err)
    throw err
  }
}

const cancelInvite = async (inviteId) => {
  try {
    await groupStore.cancelInvite(inviteId)
    notificationStore.addNotification('Invitation cancelled', 'success')
    await fetchPendingInvites()
  } catch (err) {
    notificationStore.addNotification('Failed to cancel invitation', 'error')
    console.error('Error cancelling invite:', err)
  }
}

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  return new Date(timestamp.toDate()).toLocaleDateString()
}

onMounted(() => {
  fetchPendingInvites()
})
</script>

  <style lang="scss" scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.75);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background: #18181B;
    border-radius: 10px;
    width: 90%;
    max-width: 600px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .modal-header {
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      color: #fff;
      margin: 0;
      font-size: 1.5rem;
    }

    .close-btn {
      background: none;
      border: none;
      color: #9CA3AF;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      line-height: 1;

      &:hover {
        color: #fff;
      }
    }
  }

  .invite-form {
    padding: 20px;

    h4 {
      color: #fff;
      margin: 0 0 15px 0;
      font-size: 1.1rem;
    }
  }

  .current-members {
    margin-bottom: 20px;

    .members-list {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 6px;
      padding: 10px;
    }

    .member-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px;

      .member-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
      }

      .member-name {
        color: #fff;
        flex: 1;
      }

      .member-role {
        color: #9CA3AF;
        font-size: 0.9em;
      }
    }
  }

  .form-group {
    margin-bottom: 20px;

    label {
      display: block;
      color: #fff;
      margin-bottom: 8px;
    }

    .email-input-wrapper {
      display: flex;
      gap: 10px;

      input {
        flex: 1;
        padding: 10px;
        background: #27272A;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        color: #fff;
        font-size: 0.95em;

        &:focus {
          outline: none;
          border-color: #c41e3a;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }
  }

  .pending-invites {
    .invites-list {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 6px;
      padding: 10px;
    }

    .invite-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px;

      .invite-email {
        color: #fff;
        flex: 1;
      }

      .invite-date {
        color: #9CA3AF;
        font-size: 0.9em;
      }
    }
  }

  .btn {
    padding: 10px 20px;
    border-radius: 6px;
    font-size: 0.95em;
    cursor: pointer;
    border: none;
    transition: all 0.3s ease;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &.primary {
      background: #c41e3a;
      color: white;

      &:hover:not(:disabled) {
        background: darken(#c41e3a, 10%);
      }
    }

    &.small {
      padding: 6px 12px;
      font-size: 0.85em;
    }

    &.danger {
      background: #DC2626;
      color: white;

      &:hover:not(:disabled) {
        background: darken(#DC2626, 10%);
      }
    }
  }

  @media (max-width: 640px) {
    .modal-content {
      width: 95%;
      margin: 20px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .email-input-wrapper {
      flex-direction: column;

      .btn {
        width: 100%;
      }
    }
  }

  .error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  margin-bottom: 0;
}

.email-input-wrapper {
  margin-bottom: 4px;
}
  </style>
