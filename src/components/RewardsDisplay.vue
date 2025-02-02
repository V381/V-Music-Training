<template>
    <div class="rewards-display">
      <div class="points-banner">
        <div class="points">
          <i class="fas fa-star"></i>
          <span>{{ rewardStore.userPoints }} Points</span>
        </div>
      </div>

      <div class="achievements-grid">
        <div
          v-for="(achievement, id) in rewardStore.availableAchievements"
          :key="id"
          class="achievement-card"
          :class="{ unlocked: rewardStore.achievements.includes(id) }"
        >
          <div class="achievement-icon">{{ achievement.icon }}</div>
          <h4>{{ achievement.title }}</h4>
          <p>{{ achievement.description }}</p>
        </div>
      </div>
    </div>
  </template>

<script setup>
import { onMounted } from 'vue'
import { useRewardStore } from '../stores/rewards'

const rewardStore = useRewardStore()

onMounted(async () => {
  await rewardStore.initializeRewards()
})

</script>

  <style lang="scss" scoped>
  .rewards-display {
    background: #18181B;
    padding: 30px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .points-banner {
    background: linear-gradient(to right, #c41e3a, #ff4655);
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 30px;
    text-align: center;

    .points {
      font-size: 24px;
      color: white;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;

      i {
        color: #FFD700;
      }
    }
  }

  .achievements-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }

  .achievement-card {
    background: rgba(255, 255, 255, 0.05);
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    opacity: 0.5;
    transition: all 0.3s ease;

    &.unlocked {
      opacity: 1;
      transform: translateY(-5px);
    }

    .achievement-icon {
      font-size: 40px;
      margin-bottom: 15px;
    }

    h4 {
      color: #fff;
      margin-bottom: 10px;
    }

    p {
      color: #9CA3AF;
      margin-bottom: 15px;
      font-size: 0.9em;
    }

    .points-value {
      color: #4CAF50;
      font-weight: bold;
    }
  }
  </style>
