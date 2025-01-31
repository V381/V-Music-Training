<template>
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Create New Group</h3>
          <button class="close-btn" @click="$emit('close')">×</button>
        </div>

        <form @submit.prevent="handleSubmit" class="group-form">
          <div class="form-group">
            <label>Group Name</label>
            <input
              v-model="groupData.name"
              type="text"
              required
              placeholder="Enter group name"
              maxlength="50"
            >
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea
              v-model="groupData.description"
              required
              placeholder="Describe your group's purpose and goals"
              rows="4"
              maxlength="200"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="groupData.isPublic"
              >
              Make this group public
            </label>
            <span class="helper-text">Public groups can be found and joined by other users</span>
          </div>

          <div class="form-actions">
            <button
              type="button"
              class="btn secondary"
              @click="$emit('close')"
              :disabled="isSubmitting"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn primary"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Creating...' : 'Create Group' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>

<script setup>
import { ref, defineEmits } from 'vue'
import { useGroupStore } from '../stores/groups'
import { useNotificationStore } from '../stores/notification'

const emit = defineEmits(['close', 'created'])
const groupStore = useGroupStore()
const notificationStore = useNotificationStore()

const groupData = ref({
  name: '',
  description: '',
  isPublic: false
})

const isSubmitting = ref(false)

const handleSubmit = async () => {
  if (isSubmitting.value) return

  try {
    isSubmitting.value = true
    await groupStore.createGroup(groupData.value)
    emit('created')
  } catch (err) {
    notificationStore.addNotification('Failed to create group', 'error')
    console.error('Error creating group:', err)
  } finally {
    isSubmitting.value = false
  }
}
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
    max-width: 500px;
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

  .group-form {
    padding: 20px;

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
        background: #27272A;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        color: #fff;
        font-size: 0.95em;

        &:focus {
          outline: none;
          border-color: #c41e3a;
        }
      }

      textarea {
        resize: vertical;
        min-height: 100px;
      }

      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;

        input[type="checkbox"] {
          width: auto;
          cursor: pointer;
        }
      }

      .helper-text {
        display: block;
        color: #9CA3AF;
        font-size: 0.85em;
        margin-top: 4px;
        margin-left: 24px;
      }
    }
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 30px;

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

      &.secondary {
        background: #4B5563;
        color: white;

        &:hover:not(:disabled) {
          background: darken(#4B5563, 10%);
        }
      }
    }
  }

  @media (max-width: 640px) {
    .modal-content {
      width: 95%;
      margin: 20px;
    }

    .form-actions {
      flex-direction: column;

      .btn {
        width: 100%;
      }
    }
  }
  </style>
