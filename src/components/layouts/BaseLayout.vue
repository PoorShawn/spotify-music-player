<script setup lang="ts">
import SideNav from '@/components/SideNav.vue'
import Player from '@/components/MusicPlayer.vue'
</script>

<template>
  <div class="app-layout">
    <SideNav />

    <div class="main-container">
      <div class="content">
        <slot></slot>
      </div>
      <Player />
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(to bottom, #1a1a1a, #121212);
  color: white;
}

.main-container {
  flex: 1;
  margin-left: 280px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 100px 20px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

.content::-webkit-scrollbar {
  width: 8px;
}

.content::-webkit-scrollbar-track {
  background: transparent;
}

.content::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.content:hover::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
}

@media (max-width: 768px) {
  .main-container {
    margin-left: 0;
  }

  .content {
    padding: 0 16px 60px 16px;
  }
}
</style>
