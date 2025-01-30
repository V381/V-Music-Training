<template>
  <div v-if="show" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Practice Session Complete</h2>
        <button class="close-btn" @click="handleClose">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <p class="tool-name">{{ toolName }}</p>

        <div class="rating-section">
          <label>Rate your session:</label>
          <div class="stars">
            <i v-for="n in 5"
              :key="n"
              class="fas fa-star"
              :class="{ 'active': rating >= n }"
              @click="rating = n">
            </i>
          </div>
        </div>

        <div class="notes-section">
          <label>Session Notes (optional):</label>
          <textarea
            v-model="notes"
            placeholder="How was your practice? What did you learn?"
            rows="4">
          </textarea>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn secondary" @click="handleClose">Cancel</button>
        <button class="btn primary" @click="handleSave">Save Practice</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits, defineProps } from 'vue'

defineProps({
  show: {
    type: Boolean,
    required: true
  },
  toolName: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:show', 'save', 'close'])

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
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #18181B;
  width: 90%;
  max-width: 500px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    color: #fff;
    margin: 0;
    font-size: 1.5rem;
  }

  .close-btn {
    background: none;
    border: none;
    color: #9CA3AF;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 5px;

    &:hover {
      color: #fff;
    }
  }
}

.modal-body {
  padding: 20px;

  .tool-name {
    color: #c41e3a;
    font-size: 1.2rem;
    margin-bottom: 20px;
  }
}

.rating-section, .notes-section {
  margin-bottom: 20px;

  label {
    display: block;
    color: #9CA3AF;
    margin-bottom: 10px;
  }
}

.stars {
  display: flex;
  gap: 10px;

  i {
    cursor: pointer;
    color: #4B5563;
    font-size: 24px;
    transition: color 0.2s ease;

    &:hover {
      color: #c41e3a;
    }

    &.active {
      color: #c41e3a;
    }
  }
}

textarea {
  width: 100%;
  background: #27272A;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 12px;
  color: #fff;
  font-size: 1rem;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #c41e3a;
  }

  &::placeholder {
    color: #6B7280;
  }
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s ease;

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

@media (max-width: 640px) {
  .modal-content {
    width: 95%;
    margin: 20px;
  }

  .stars i {
    font-size: 20px;
  }

  .modal-footer {
    flex-direction: column;

    .btn {
      width: 100%;
    }
  }
}
</style>
