<template>
    <div class="practice-groups">
      <div class="groups-header">
        <h2>Practice Groups</h2>
        <button
          class="btn primary"
          @click="showCreator = true"
          v-if="!showCreator"
        >
          Create New Group
        </button>
      </div>

      <div v-if="groupStore.isLoading" class="loading-state">
        <LoadingSpinner text="Loading groups..." />
      </div>

      <div v-else-if="groupStore.error" class="error-state">
        <p>{{ groupStore.error }}</p>
        <button class="btn secondary" @click="retryFetch">
          Retry
        </button>
      </div>

      <div v-else-if="!groupStore.groups.length" class="empty-state">
        <p>You haven't joined any groups yet.</p>
        <button class="btn primary" @click="showCreator = true">
          Create Your First Group
        </button>
      </div>

      <div v-else class="groups-grid">
        <div
          v-for="group in groupStore.groups"
          :key="group.id"
          class="group-card"
        >
          <div class="group-header">
            <h3>{{ group.name }}</h3>
            <span class="member-count">
              {{ group.memberDetails.length }} members
            </span>
          </div>

          <p class="description">{{ group.description }}</p>

          <div class="members-preview">
            <div
              v-for="member in group.memberDetails.slice(0, 3)"
              :key="member.id"
              class="member-avatar"
            >
              <img
                :src="member.photoURL || '/default-avatar.png'"
                :alt="member.displayName"
              >
            </div>
            <span v-if="group.memberDetails.length > 3" class="more-members">
              +{{ group.memberDetails.length - 3 }}
            </span>
          </div>

          <div class="group-stats">
            <div class="stat">
              <span class="label">Total Practice</span>
              <span class="value">{{ formatTime(group.totalPracticeTime) }}</span>
            </div>
            <div class="stat">
              <span class="label">Last Active</span>
              <span class="value">{{ formatDate(group.lastActive) }}</span>
            </div>
          </div>

          <div class="group-actions">
            <button
              class="btn secondary"
              @click="showInviteModal(group)"
              v-if="group.createdBy === currentUser?.uid"
            >
              Invite Member
            </button>
            <button
              class="btn primary"
              @click="startGroupPractice(group)"
            >
              Start Practice
            </button>
          </div>
        </div>
      </div>

      <!-- Group Creator Modal -->
      <GroupCreator
        v-if="showCreator"
        @close="showCreator = false"
        @created="handleGroupCreated"
      />

      <!-- Invite Modal -->
      <InviteMemberModal
        v-if="showInvite"
        :group="selectedGroup"
        @close="closeInviteModal"
        @invited="handleMemberInvited"
      />
    </div>
  </template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useGroupStore } from '../stores/groups'
import { useNotificationStore } from '../stores/notification'
import { auth } from '../config/firebase'
import LoadingSpinner from './LoadingSpinner.vue'
import GroupCreator from './GroupCreator.vue'
import InviteMemberModal from './InviteMemberModal.vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const groupStore = useGroupStore()
const notificationStore = useNotificationStore()
const showCreator = ref(false)
const showInvite = ref(false)
const selectedGroup = ref(null)

const currentUser = computed(() => auth.currentUser)

const formatTime = (minutes) => {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}

const startGroupPractice = async (group) => {
  try {
    const sessionId = await groupStore.startGroupSession({
      groupId: group.id,
      startTime: new Date(),
      members: [auth.currentUser.uid]
    })

    router.push(`/groups/${group.id}/practice/${sessionId}`)
  } catch (err) {
    notificationStore.addNotification('Failed to start practice session', 'error')
    console.error('Error starting practice:', err)
  }
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'Never'

  // Handle Firebase Timestamp
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toLocaleDateString()
  }

  // Handle regular Date object or timestamp number
  if (timestamp instanceof Date) {
    return timestamp.toLocaleDateString()
  }

  // Handle timestamp as number
  if (typeof timestamp === 'number') {
    return new Date(timestamp).toLocaleDateString()
  }

  // If it's already a string, return as is
  if (typeof timestamp === 'string') {
    return new Date(timestamp).toLocaleDateString()
  }

  return 'Invalid date'
}

const retryFetch = () => {
  groupStore.fetchGroups()
}

const showInviteModal = (group) => {
  selectedGroup.value = group
  showInvite.value = true
}

const closeInviteModal = () => {
  showInvite.value = false
  selectedGroup.value = null
}

const handleGroupCreated = () => {
  showCreator.value = false
  notificationStore.addNotification('Group created successfully!', 'success')
}

const handleMemberInvited = () => {
  closeInviteModal()
  notificationStore.addNotification('Invitation sent successfully!', 'success')
}

onMounted(() => {
  groupStore.fetchGroups()
})
</script>

<style lang="scss" scoped>
.practice-groups {
  padding: 30px;

  .groups-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;

    h2 {
      color: #fff;
      font-size: 24px;
      margin: 0;
    }

    .btn.primary {
      background: #c41e3a;
      color: white;
      padding: 10px 20px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      transition: background-color 0.3s ease;

      &:hover {
        background: darken(#c41e3a, 10%);
      }
    }
  }

  .groups-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }

  .group-card {
    background: #18181B;
    padding: 20px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);

    .group-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      h3 {
        color: #fff;
        margin: 0;
      }

      .member-count {
        color: #9CA3AF;
        font-size: 0.9em;
      }
    }

    .description {
      color: #D1D5DB;
      margin-bottom: 20px;
      font-size: 0.95em;
      line-height: 1.5;
    }

    .group-stats {
      display: flex;
      justify-content: space-between;
      background: rgba(0, 0, 0, 0.2);
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;

      .stat {
        display: flex;
        flex-direction: column;
        align-items: center;

        .label {
          color: #9CA3AF;
          font-size: 0.8em;
          margin-bottom: 5px;
        }

        .value {
          color: #fff;
          font-weight: 500;
        }
      }
    }

    .group-actions {
      display: flex;
      gap: 10px;

      .btn {
        flex: 1;
        padding: 10px;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.9em;

        &.primary {
          background: #c41e3a;
          color: white;

          &:hover {
            background: darken(#c41e3a, 10%);
          }
        }

        &.secondary {
          background: #4B5563;
          color: white;

          &:hover {
            background: darken(#4B5563, 10%);
          }
        }
      }
    }
  }

  .group-creator {
    background: #18181B;
    padding: 30px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);

    h3 {
      color: #fff;
      margin-bottom: 20px;
    }

    .form-group {
      margin-bottom: 20px;

      label {
        display: block;
        color: #fff;
        margin-bottom: 8px;
      }

      input, textarea {
        width: 100%;
        padding: 10px;
        border-radius: 6px;
        background: #27272A;
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #fff;
        font-size: 0.95em;

        &:focus {
          outline: none;
          border-color: #c41e3a;
        }
      }

      textarea {
        min-height: 100px;
        resize: vertical;
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;

      .btn {
        padding: 10px 20px;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;

        &.primary {
          background: #c41e3a;
          color: white;

          &:hover {
            background: darken(#c41e3a, 10%);
          }
        }

        &.secondary {
          background: #4B5563;
          color: white;

          &:hover {
            background: darken(#4B5563, 10%);
          }
        }
      }
    }
  }

  @media (max-width: 768px) {
    padding: 20px;

    .groups-header {
      flex-direction: column;
      align-items: stretch;
      gap: 15px;

      h2 {
        text-align: center;
      }
    }

    .group-card {
      .group-stats {
        flex-direction: column;
        gap: 10px;

        .stat {
          flex-direction: row;
          justify-content: space-between;
          width: 100%;
        }
      }

      .group-actions {
        flex-direction: column;
      }
    }

    .group-creator {
      padding: 20px;

      .form-actions {
        flex-direction: column;
      }
    }
  }
}

.empty-state {
  background: #18181B;
  border-radius: 10px;
  padding: 40px 20px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.empty-content {
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 48px;
  color: #c41e3a;
  margin-bottom: 20px;

  i {
    opacity: 0.8;
  }
}

h3 {
  color: #fff;
  font-size: 24px;
  margin-bottom: 10px;
  font-weight: 500;
}

p {
  color: #9CA3AF;
  margin-bottom: 25px;
  font-size: 16px;
  line-height: 1.5;
}

.btn.primary {
  background: #c41e3a;
  color: white;
  padding: 12px 24px;
  border-radius: 6px;
  border: none;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background: darken(#c41e3a, 10%);
  }
}
</style>
