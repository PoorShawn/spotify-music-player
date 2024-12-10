<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { spotifyApi } from '@/config/spotifySDK'
import type { Category, SimplifiedPlaylist } from '@spotify/web-api-ts-sdk'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'

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
  <div class="content">
    <LoadingSpinner v-if="isLoading" text="正在加载分类内容..." />

    <template v-else>
      <header class="category-header">
        <h1>{{ category?.name }}</h1>
      </header>

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
</template>

<style scoped>
.content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
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
  background: linear-gradient(to right, #fff, #b3b3b3);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
}

.playlist-card:hover .play-overlay {
  opacity: 1;
}

.play-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #1db954;
  border: none;
  color: white;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  transform: scale(0.8);
}

.playlist-card:hover .play-button {
  transform: scale(1);
}

.play-button:hover {
  background: #1ed760;
  transform: scale(1.1) !important;
}

.playlist-info h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-info p {
  color: #b3b3b3;
  font-size: 0.875rem;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 768px) {
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

  .playlist-info h3 {
    font-size: 0.9rem;
  }

  .playlist-info p {
    font-size: 0.8rem;
  }
}
</style>
