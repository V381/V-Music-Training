<template>
    <div class="public-groups">
      <div v-if="isLoading" class="loading-state">
        <LoadingSpinner text="Loading public groups..." />
      </div>

      <div v-else-if="publicGroups.length === 0" class="empty-state">
        <p>No public groups available</p>
      </div>

      <div v-else class="groups-grid">
        <div v-for="group in publicGroups"
             :key="group.id"
             class="group-card"
        >
          <div class="group-header">
            <h3>{{ group.name }}</h3>
            <span class="member-count">
              {{ group.memberDetails?.length || 0 }} members
            </span>
          </div>

          <p class="description">{{ group.description }}</p>

          <div class="members-preview" v-if="group.memberDetails?.length">
            <div v-for="member in group.memberDetails.slice(0, 3)"
                 :key="member.id"
                 class="member-avatar"
            >
              <img v-if="member.photoURL"
                   :src="member.photoURL"
                   :alt="member.displayName"
                   @error="handleImageError($event, member)"
              >
              <div v-else
                   class="avatar-placeholder"
                   :style="{ backgroundColor: getRandomColor(member.id) }"
              >
                {{ member.displayName ? member.displayName[0].toUpperCase() : '?' }}
              </div>
            </div>
            <span v-if="group.memberDetails.length > 3" class="more-members">
              +{{ group.memberDetails.length - 3 }}
            </span>
          </div>

          <div class="group-actions">
            <button class="btn primary"
                    @click="handleJoin(group)"
                    :disabled="isJoining === group.id"
            >
              {{ isJoining === group.id ? 'Joining...' : 'Join Group' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useGroupStore } from '../stores/groups'
import { useNotificationStore } from '../stores/notification'
import LoadingSpinner from './LoadingSpinner.vue'
import { auth } from '../config/firebase'

const groupStore = useGroupStore()
const notificationStore = useNotificationStore()

const allPublicGroups = ref([])
const isLoading = ref(false)
const isJoining = ref(null)

// Filter out groups where user is already a member
const publicGroups = computed(() => {
  return allPublicGroups.value.filter(group => {
    return !group.members?.includes(auth.currentUser?.uid)
  })
})

const getRandomColor = (userId) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB'
  ]
  const index = [...userId].reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[index % colors.length]
}

const handleImageError = (event, member) => {
  const div = document.createElement('div')
  div.className = 'avatar-placeholder'
  div.style.backgroundColor = getRandomColor(member.id)
  div.textContent = member.displayName ? member.displayName[0].toUpperCase() : '?'
  event.target.parentNode.replaceChild(div, event.target)
}

const handleJoin = async (group) => {
  isJoining.value = group.id
  try {
    await groupStore.joinGroup(group.id)
    notificationStore.addNotification('Successfully joined group', 'success')
    await loadPublicGroups()
  } catch (err) {
    notificationStore.addNotification('Failed to join group', 'error')
    console.error('Error joining group:', err)
  } finally {
    isJoining.value = null
  }
}

const loadPublicGroups = async () => {
  isLoading.value = true
  try {
    allPublicGroups.value = await groupStore.fetchPublicGroups()
  } catch (err) {
    console.error('Error loading public groups:', err)
    notificationStore.addNotification('Failed to load public groups', 'error')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadPublicGroups()
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

        &.warning {
          background: #F59E0B;
          color: white;

          &:hover {
            background: darken(#F59E0B, 10%);
          }
        }

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

.members-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  flex-wrap: wrap;

  .member-avatar {
    width: 32px;
    height: 32px;
    position: relative;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #18181B;
    }
  }

  .avatar-placeholder {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: white;
    font-size: 14px;
    border: 2px solid #18181B;
    text-align: center;
    line-height: 1;
    text-transform: uppercase;
  }

  .more-members {
    color: #9CA3AF;
    font-size: 0.9em;
    background: rgba(255, 255, 255, 0.05);
    padding: 4px 8px;
    border-radius: 16px;
  }
}

.btn.danger {
  background: #DC2626;
  color: white;

  &:hover {
    background: darken(#DC2626, 10%);
  }
}

.group-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;

  .btn {
    flex: 1;
    min-width: max-content;
    white-space: nowrap;
  }
}

@media (max-width: 768px) {
  .group-actions {
    flex-direction: column;

    .btn {
      width: 100%;
    }
  }
}
  </style>
