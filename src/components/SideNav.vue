<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { spotifyApi } from '@/config/spotifySDK'
import type { SimplifiedPlaylist } from '@spotify/web-api-ts-sdk'

const route = useRoute()
const router = useRouter()
const isCollapsed = ref(false)
const recentPlaylists = ref<SimplifiedPlaylist[]>([])

const menuItems = [
  { name: 'Home', icon: 'fas fa-home', path: '/' },
  { name: 'Explore', icon: 'fas fa-compass', path: '/explore' },
  { name: 'Albums', icon: 'fas fa-compact-disc', path: '/albums' },
  { name: 'Playlists', icon: 'fas fa-list', path: '/playlists' },
]

// 获取用户最近的播放列表
async function loadRecentPlaylists() {
  try {
    const response = await spotifyApi.currentUser.playlists.playlists(5) // 只获取最近的5个
    recentPlaylists.value = response.items
  } catch (error) {
    console.error('Failed to load recent playlists:', error)
  }
}

// 跳转到播放列表详情
function navigateToPlaylist(playlistId: string) {
  router.push(`/playlist/${playlistId}`)
}

onMounted(() => {
  loadRecentPlaylists()
})
</script>

<template>
  <nav class="side-nav" :class="{ collapsed: isCollapsed }">
    <div class="logo">
      <img src="/images/logo.svg" alt="Musify" />
      <span v-if="!isCollapsed">Musify</span>
    </div>

    <div class="menu-section">
      <ul class="menu-list">
        <li v-for="item in menuItems" :key="item.name">
          <RouterLink :to="item.path" :class="{ active: route.path === item.path }">
            <i :class="item.icon"></i>
            <span v-if="!isCollapsed">{{ item.name }}</span>
          </RouterLink>
        </li>
      </ul>
    </div>

    <div class="playlist-section" v-if="!isCollapsed">
      <h3 class="section-title">最近播放列表</h3>
      <div 
        class="playlist-item" 
        v-for="playlist in recentPlaylists" 
        :key="playlist.id"
        @click="navigateToPlaylist(playlist.id)"
      >
        <div class="playlist-icon">
          <img 
            v-if="playlist.images?.[0]?.url" 
            :src="playlist.images[0].url" 
            :alt="playlist.name"
          />
          <i v-else class="fas fa-music"></i>
        </div>
        <div class="playlist-info">
          <h4>{{ playlist.name }}</h4>
          <p>{{ playlist.owner.display_name }}</p>
          <!-- <span class="playlist-type">{{ playlist. }} 首歌曲</span> -->
        </div>
      </div>
    </div>

    <button class="collapse-btn" @click="isCollapsed = !isCollapsed">
      <i :class="isCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
    </button>
  </nav>
</template>

<style scoped>
.side-nav {
  width: 280px;
  height: 100vh;
  background-color: #121212;
  color: #b3b3b3;
  padding: 20px 0;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  z-index: 1000;
}

.side-nav.collapsed {
  width: 80px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 24px;
  margin-bottom: 24px;
  color: #1db954;
}

.logo img {
  width: 32px;
  height: 32px;
  transition: transform 0.2s ease;
}

.logo:hover img {
  transform: scale(1.05);
}

.menu-section {
  margin-bottom: 24px;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-list li a {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 24px;
  color: #b3b3b3;
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
}

.menu-list li a::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: #1db954;
  transform: scaleY(0);
  transition: transform 0.2s ease;
}

.menu-list li a:hover,
.menu-list li a.active {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

.menu-list li a.active::before {
  transform: scaleY(1);
}

.menu-list li a i {
  font-size: 20px;
  width: 24px;
  text-align: center;
  transition: transform 0.2s ease;
}

.menu-list li a:hover i {
  transform: scale(1.1);
}

.playlist-section {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px;
  margin: 0 4px;
  /* 自定义滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

.playlist-section::-webkit-scrollbar {
  width: 6px;
}

.playlist-section::-webkit-scrollbar-track {
  background: transparent;
}

.playlist-section::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  transition: background-color 0.2s ease;
}

.playlist-section:hover::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
}

.playlist-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  margin-bottom: 4px;
}

.playlist-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.playlist-icon {
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b3b3b3;
  transition: all 0.2s ease;
}

.playlist-item:hover .playlist-icon {
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
}

.playlist-info {
  flex: 1;
  min-width: 0;
}

.playlist-info h4 {
  margin: 0;
  font-size: 0.9rem;
  color: #e0e0e0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s ease;
}

.playlist-info p {
  margin: 2px 0;
  font-size: 0.8rem;
  color: #909090;
  transition: color 0.2s ease;
}

.playlist-type {
  font-size: 0.75rem;
  color: #707070;
  transition: color 0.2s ease;
}

.playlist-item:hover .playlist-info h4 {
  color: white;
}

.playlist-item:hover .playlist-info p {
  color: #b3b3b3;
}

.playlist-item:hover .playlist-type {
  color: #909090;
}

.collapse-btn {
  position: absolute;
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #282828;
  border: none;
  color: #b3b3b3;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.collapse-btn:hover {
  background-color: #383838;
  color: white;
  transform: translateY(-50%) scale(1.1);
}

/* 响应式样式 */
@media (max-width: 768px) {
  .side-nav {
    width: 100%;
    height: 56px;
    position: fixed;
    bottom: 0;
    top: auto;
    padding: 0;
    flex-direction: row;
    align-items: center;
    background-color: rgba(18, 18, 18, 0.98);
    backdrop-filter: blur(10px);
    box-shadow: 0 -1px 0 rgba(255, 255, 255, 0.1);
    z-index: 1001;
  }

  .side-nav.collapsed {
    width: 100%;
  }

  .logo {
    display: none;
  }

  .menu-section {
    margin: 0;
    width: 100%;
  }

  .menu-list {
    display: flex;
    justify-content: space-around;
    padding: 0 16px;
  }

  .menu-list li a {
    flex-direction: column;
    gap: 4px;
    padding: 8px 16px;
    font-size: 20px;
  }

  .menu-list li a::before {
    display: none;
  }

  .menu-list li a span {
    font-size: 11px;
    margin-top: 2px;
  }

  .menu-list li a i {
    font-size: 18px;
  }

  .menu-list li a.active {
    color: #1db954;
    background: none;
  }

  .playlist-section {
    display: none;
  }

  .collapse-btn {
    display: none;
  }
}

.section-title {
  padding: 0 24px;
  margin: 0 0 16px 0;
  font-size: 0.875rem;
  color: #909090;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.playlist-icon img {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
}
</style>
