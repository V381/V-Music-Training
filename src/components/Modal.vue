<template>
    <div class="modal-overlay" @click="handleOverlayClick">
      <div class="modal" :class="{ 'modal-large': large }">
        <div class="modal-header">
          <slot name="header"></slot>
          <button class="close-btn" @click="$emit('close')">×</button>
        </div>
        <div class="modal-content">
          <slot></slot>
        </div>
        <div v-if="$slots.footer" class="modal-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </template>

<script setup>
import { defineEmits, defineProps } from 'vue'

const emit = defineEmits(['close'])
const props = defineProps({
  large: {
    type: Boolean,
    default: false
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  }
})

const handleOverlayClick = (event) => {
  if (props.closeOnOverlay && event.target.classList.contains('modal-overlay')) {
    emit('close')
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
    padding: 20px;
  }

  .modal {
    background: #18181B;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(255, 255, 255, 0.1);
    animation: modalEnter 0.3s ease;

    &.modal-large {
      max-width: 800px;
    }
  }

  .modal-header {
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;
    font-size: 1.2em;
    font-weight: 500;
  }

  .close-btn {
    background: none;
    border: none;
    color: #9CA3AF;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    line-height: 1;
    transition: color 0.3s ease;

    &:hover {
      color: white;
    }
  }

  .modal-content {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
    color: #D1D5DB;
  }

  .modal-footer {
    padding: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  @keyframes modalEnter {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @media (max-width: 640px) {
    .modal {
      width: 100%;
      max-height: 100vh;
      border-radius: 0;
    }

    .modal-overlay {
      padding: 0;
    }
  }
  </style>
