<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { spotifyApi } from '@/config/spotifySDK'
import type { Category, SimplifiedPlaylist } from '@spotify/web-api-ts-sdk'
import SideNav from '@/components/SideNav.vue'
import Player from '@/components/MusicPlayer.vue'

const route = useRoute()
const category = ref<Category | null>(null)
const playlists = ref<SimplifiedPlaylist[]>([])
const isLoading = ref(true)

async function loadCategoryData() {
  try {
    const categoryId = route.params.id as string
    const country = 'US'
    const playlistLimit = 50

    // 分别获取分类信息和播放列表
    const categoryResponse = await spotifyApi.browse.getCategory(categoryId, country)
    console.log(categoryResponse)

    const playlistsResponse = await spotifyApi.browse.getPlaylistsForCategory(
      categoryId,
      country,
      playlistLimit,
      0,
    )
    console.log(playlistsResponse)

    // 更新数据
    category.value = categoryResponse
    playlists.value = playlistsResponse.playlists.items
  } catch (error) {
    console.error('Failed to load category data:', error)
  } finally {
    isLoading.value = false
  }
}

async function playPlaylist(playlistId: string) {
  try {
    const device_id = localStorage.getItem('device_id')
    if (!device_id) {
      console.error('No device ID found')
      return
    }

    await spotifyApi.player.startResumePlayback(device_id, `spotify:playlist:${playlistId}`)
  } catch (error) {
    console.error('Failed to play playlist:', error)
  }
}

onMounted(() => {
  loadCategoryData()
})
</script>

<template>
  <div class="app-layout">
    <SideNav />
    <div class="main-container">
      <div class="content">
        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>正在加载分类内容...</p>
        </div>

        <template v-else>
          <!-- 分类头部 -->
          <header class="category-header">
            <h1>{{ category?.name }}</h1>
            <p class="description">{{ category?.name }}</p>
          </header>

          <!-- 播放列表网格 -->
          <div class="playlists-grid">
            <div
              v-for="playlist in playlists"
              :key="playlist.id"
              class="playlist-card"
              @click="playPlaylist(playlist.id)"
            >
              <div class="playlist-image">
                <img :src="playlist.images[0]?.url" :alt="playlist.name" />
                <div class="play-overlay">
                  <button class="play-button">
                    <i class="fas fa-play"></i>
                  </button>
                </div>
              </div>
              <div class="playlist-info">
                <h3>{{ playlist.name }}</h3>
                <p>{{ playlist.description }}</p>
              </div>
            </div>
          </div>
        </template>
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
  padding: 24px;
}

.loading-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: #1db954;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.category-header {
  margin-bottom: 32px;
  padding: 24px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.1), transparent);
  border-radius: 8px;
}

.category-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.category-header .description {
  color: #b3b3b3;
  font-size: 1rem;
}

.playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

.playlist-card {
  background-color: #181818;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.playlist-card:hover {
  background-color: #282828;
  transform: translateY(-4px);
}

.playlist-image {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  margin-bottom: 16px;
  border-radius: 4px;
  overflow: hidden;
}

.playlist-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.playlist-card:hover .play-overlay {
  opacity: 1;
}

.play-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #1db954;
  border: none;
  color: white;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.play-button:hover {
  transform: scale(1.1);
  background-color: #1ed760;
}

.playlist-info h3 {
  font-size: 1rem;
  margin-bottom: 8px;
  color: white;
}

.playlist-info p {
  font-size: 0.875rem;
  color: #b3b3b3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 768px) {
  .main-container {
    margin-left: 0;
  }

  .content {
    padding: 16px;
  }

  .category-header {
    padding: 16px;
  }

  .category-header h1 {
    font-size: 2rem;
  }

  .playlists-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }
}
</style>
