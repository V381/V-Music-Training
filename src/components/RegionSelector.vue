<template>
    <div class="region-selector">
      <h3>Change Your Region</h3>
      <select v-model="selectedRegion" @change="updateRegion">
        <option value="">Global</option>
        <option v-for="region in regions" :key="region.code" :value="region.code">
          {{ region.name }}
        </option>
      </select>
    </div>
  </template>

<script setup>
import { ref, onMounted } from 'vue'
import { useLeaderboardStore } from '../stores/leaderboard'

const leaderboardStore = useLeaderboardStore()
const selectedRegion = ref('')

const regions = [
  { code: 'NA', name: 'North America' },
  { code: 'EU', name: 'Europe' },
  { code: 'AS', name: 'Asia' },
  { code: 'SA', name: 'South America' },
  { code: 'AF', name: 'Africa' },
  { code: 'OC', name: 'Oceania' }
]

const updateRegion = async () => {
  await leaderboardStore.setUserRegion(selectedRegion.value)
}

onMounted(async () => {
  await leaderboardStore.fetchUserRegion()
  selectedRegion.value = leaderboardStore.userRegion || ''
})
</script>

  <style lang="scss" scoped>
  .region-selector {
    margin-bottom: 20px;
    padding: 15px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;

    h3 {
      margin-bottom: 10px;
      color: #fff;
    }

    select {
      width: 100%;
      padding: 8px;
      border-radius: 4px;
      background: #27272A;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #fff;
      cursor: pointer;

      &:focus {
        outline: none;
        border-color: #c41e3a;
      }

      option {
        background: #27272A;
      }
    }
  }
  </style>
