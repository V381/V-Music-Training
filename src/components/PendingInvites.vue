<template>
    <div class="pending-invites">
      <div v-if="isLoading" class="loading-state">
        <LoadingSpinner text="Loading invites..." />
      </div>

      <div v-else-if="invites.length === 0" class="no-invites">
        No pending invites
      </div>

      <div v-else class="invites-list">
        <div v-for="invite in invites" :key="invite.id" class="invite-card">
          <div class="invite-content">
            <h4>{{ invite.group.name }}</h4>
            <p class="description">{{ invite.group.description }}</p>
            <div class="invite-details">
                <span>From: {{ invite.sender }}</span>
                <span>Sent: {{ formatDate(invite.createdAt) }}</span>
            </div>
          </div>
          <div class="invite-actions">
            <button class="btn decline" @click="handleDecline(invite.id)">
              Decline
            </button>
            <button
              class="btn accept"
              @click="handleAccept(invite.id, invite.group.id)"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGroupStore } from '../stores/groups'
import { useNotificationStore } from '../stores/notification'
import LoadingSpinner from './LoadingSpinner.vue'

const groupStore = useGroupStore()
const notificationStore = useNotificationStore()
const invites = ref([])
const isLoading = ref(false)

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  return new Date(timestamp.toDate()).toLocaleDateString()
}

const handleAccept = async (inviteId, groupId) => {
  try {
    await groupStore.acceptInvite(inviteId, groupId)
    notificationStore.addNotification('Successfully joined group', 'success')
    await loadInvites()
  } catch (err) {
    console.log(err)
    notificationStore.addNotification('Failed to accept invite', 'error')
  }
}

const handleDecline = async (inviteId) => {
  try {
    await groupStore.updateInviteStatus(inviteId, 'declined')
    notificationStore.addNotification('Invite declined', 'info')
    invites.value = invites.value.filter(invite => invite.id !== inviteId)
  } catch (err) {
    console.error('Error declining invite:', err)
    notificationStore.addNotification('Failed to decline invite', 'error')
  }
}
const loadInvites = async () => {
  isLoading.value = true
  try {
    invites.value = await groupStore.fetchPendingInvites()
  } catch (err) {
    console.error('Error loading invites:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  isLoading.value = true
  try {
    invites.value = await groupStore.fetchPendingInvites()
  } catch (err) {
    console.error('Error loading invites:', err)
    notificationStore.addNotification('Failed to load invites', 'error')
  } finally {
    isLoading.value = false
  }
})
</script>

  <style lang="scss" scoped>
  .pending-invites {
    margin-bottom: 30px;
  }

  .invites-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .invite-card {
    background: #18181B;
    border-radius: 8px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;

    .invite-content {
      flex: 1;

      h4 {
        color: #fff;
        margin: 0 0 8px 0;
        font-size: 18px;
      }

      .description {
        color: #9CA3AF;
        margin-bottom: 10px;
        font-size: 14px;
      }

      .invite-details {
        display: flex;
        gap: 15px;
        color: #6B7280;
        font-size: 12px;
      }
    }

    .invite-actions {
      display: flex;
      gap: 10px;

      .btn {
        padding: 8px 16px;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s ease;

        &.accept {
          background: #c41e3a;
          color: white;

          &:hover {
            background: darken(#c41e3a, 10%);
          }
        }

        &.decline {
          background: #4B5563;
          color: white;

          &:hover {
            background: darken(#4B5563, 10%);
          }
        }
      }
    }
  }

  .loading-state, .no-invites {
    text-align: center;
    padding: 20px;
    color: #9CA3AF;
  }
  </style>
