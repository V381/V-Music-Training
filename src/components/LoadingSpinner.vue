<template>
    <div class="spinner-container">
      <div class="spinner">
        <div class="spinner-inner"></div>
      </div>
      <p v-if="text" class="spinner-text">{{ text }}</p>
    </div>
  </template>

<script setup>

import { defineProps } from 'vue'

defineProps({
  text: {
    type: String,
    default: ''
  }
})
</script>

  <style lang="scss" scoped>
  .spinner-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .spinner {
    width: 50px;
    height: 50px;
    position: relative;
  }

  .spinner-inner {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    border: 3px solid transparent;
    border-top-color: #c41e3a;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .spinner-text {
    color: #9CA3AF;
    font-size: 0.9rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  </style>
