<template>
    <div v-if="show" class="modal-overlay">
      <div class="modal-content">
        <h2>Practice Session Complete</h2>
        <p>How was your practice with {{ toolName }}?</p>

        <div class="rating-section">
          <label>Rate your session:</label>
          <div class="rating">
            <i v-for="n in 5"
               :key="n"
               class="fas fa-star"
               :class="{ 'active': rating >= n }"
               @click="rating = n"></i>
          </div>
        </div>

        <div class="notes-section">
          <label>Notes (optional):</label>
          <textarea v-model="notes" placeholder="Add any notes about your practice session..."></textarea>
        </div>

        <div class="modal-buttons">
          <button @click="handleSave" class="btn primary">Save Session</button>
          <button @click="handleClose" class="btn secondary">Close</button>
        </div>
      </div>
    </div>
  </template>

<script setup>
import { ref, defineEmits } from 'vue'

const emit = defineEmits(['save', 'close'])

const rating = ref(0)
const notes = ref('')

const handleSave = () => {
  emit('save', {
    rating: rating.value,
    notes: notes.value
  })
  resetForm()
}

const handleClose = () => {
  emit('close')
  resetForm()
}

const resetForm = () => {
  rating.value = 0
  notes.value = ''
}
</script>

  <style lang="scss" scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background: #18181B;
    padding: 30px;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    border: 1px solid rgba(255, 255, 255, 0.1);

    h2 {
      margin-bottom: 20px;
      color: #fff;
    }

    .rating-section, .notes-section {
      margin: 20px 0;

      label {
        display: block;
        margin-bottom: 10px;
        color: #9CA3AF;
      }
    }

    .rating {
      display: flex;
      gap: 10px;

      i {
        cursor: pointer;
        color: #4B5563;

        &.active {
          color: #c41e3a;
        }
      }
    }

    textarea {
      width: 100%;
      height: 100px;
      padding: 10px;
      border-radius: 6px;
      background: #27272A;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #fff;
      resize: vertical;
    }

    .modal-buttons {
      display: flex;
      gap: 10px;
      justify-content: flex-end;

      .btn {
        padding: 8px 20px;
        border-radius: 6px;
        cursor: pointer;
        border: none;

        &.primary {
          background: #c41e3a;
          color: white;
        }

        &.secondary {
          background: #4B5563;
          color: white;
        }
      }
    }
  }
  </style>
