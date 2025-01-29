<template>
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Your Practice Dashboard</h1>
        <p>Track your musical journey</p>
      </header>

      <div class="dashboard-content">
        <DashboardStats />
        <DashboardCharts />
        <DashboardHistory />
      </div>
    </div>
  </template>

<script setup>
import DashboardStats from './DashboardStats.vue'
import DashboardHistory from './DashboardHistory.vue'
import DashboardCharts from './DashboardCharts.vue'
</script>

  <style lang="scss" scoped>
  .dashboard-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
  }

  .dashboard-header {
    text-align: center;
    margin-bottom: 40px;

    h1 {
      font-size: 2.5em;
      color: #fff;
      margin-bottom: 10px;
    }

    p {
      color: #9CA3AF;
      font-size: 1.2em;
    }
  }
  </style>
