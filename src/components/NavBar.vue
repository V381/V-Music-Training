<template>
  <nav class="main-nav">
    <div class="container">
      <router-link to="/" class="logo">Music Learning Tools</router-link>

      <div class="nav-links">
        <router-link to="/">Tools</router-link>
        <router-link to="/contact">Contact</router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.main-nav {
  background: #18181B;
  padding: 16px 0;

  .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .logo {
    font-size: 20px;
    font-weight: bold;
    color: white;
    text-decoration: none;

    &:hover {
      color: #c41e3a;
      transition: color 0.3s ease;
    }
  }

  .nav-links {
    display: flex;
    gap: 20px;

    a {
      color: white;
      text-decoration: none;

      &:hover {
        color: #c41e3a;
        transition: color 0.3s ease;
      }
    }
  }
}
</style>
