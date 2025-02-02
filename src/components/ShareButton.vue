<template>
    <div class="share-buttons">
      <button
        v-for="platform in platforms"
        :key="platform.name"
        @click="share(platform)"
        :class="['share-btn', platform.name.toLowerCase()]"
      >
        <i :class="platform.icon"></i>
        {{ platform.name }}
      </button>
    </div>
  </template>

<script setup>
import { ref, defineProps } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  url: {
    type: String,
    required: true
  }
})

const platforms = ref([
  {
    name: 'Twitter',
    icon: 'fab fa-twitter',
    shareUrl: () => `https://twitter.com/intent/tweet?text=${encodeURIComponent(props.title)}&url=${encodeURIComponent(props.url)}`
  },
  {
    name: 'Facebook',
    icon: 'fab fa-facebook',
    shareUrl: () => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(props.url)}`
  },
  {
    name: 'LinkedIn',
    icon: 'fab fa-linkedin',
    shareUrl: () => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(props.url)}`
  }
])

const share = (platform) => {
  const shareUrl = platform.shareUrl()
  window.open(shareUrl, '_blank', 'width=600,height=400')
}
</script>

  <style lang="scss" scoped>
  .share-buttons {
    display: flex;
    gap: 10px;
  }

  .share-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    color: white;
    cursor: pointer;
    transition: opacity 0.3s ease;
    font-size: 14px;

    &:hover {
      opacity: 0.9;
    }

    &.twitter {
      background: #1DA1F2;
    }

    &.facebook {
      background: #4267B2;
    }

    &.linkedin {
      background: #0077B5;
    }

    i {
      font-size: 16px;
    }
  }

  @media (max-width: 640px) {
    .share-buttons {
      flex-direction: column;
    }

    .share-btn {
      justify-content: center;
    }
  }
  </style>
