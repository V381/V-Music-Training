<template>
    <div class="notification-container">
      <div
        v-for="notification in notificationStore.notifications"
        :key="notification.id"
        class="notification"
        :class="notification.type"
      >
        {{ notification.message }}
        <button
          class="close-button"
          @click="notificationStore.removeNotification(notification.id)"
        >
          ×
        </button>
      </div>
    </div>
  </template>

<script setup>

import { useNotificationStore } from '../stores/notification'
const notificationStore = useNotificationStore()
</script>

  <style lang="scss" scoped>
  .notification-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
  }

  .notification {
    background: #18181B;
    color: white;
    padding: 12px 40px 12px 16px;
    border-radius: 6px;
    margin-bottom: 10px;
    min-width: 300px;
    position: relative;
    border: 1px solid rgba(255, 255, 255, 0.1);
    animation: slideIn 0.3s ease;

    &.success {
      border-left: 4px solid #4CAF50;
    }

    &.info {
      border-left: 4px solid #2196F3;
    }

    &.warning {
      border-left: 4px solid #FF9800;
    }

    &.error {
      border-left: 4px solid #f44336;
    }

    .close-button {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #9CA3AF;
      cursor: pointer;
      font-size: 20px;
      padding: 0 5px;

      &:hover {
        color: white;
      }
    }
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  </style>@/stores/notification
