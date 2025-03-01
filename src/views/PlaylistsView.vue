<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { spotifyApi } from '@/config/spotifySDK'
import type { SimplifiedPlaylist } from '@spotify/web-api-ts-sdk'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const router = useRouter()
const playlists = ref<SimplifiedPlaylist[]>([])
const isLoading = ref(true)

async function loadPlaylists() {
  try {
    const response = await spotifyApi.currentUser.playlists.playlists(20)
    playlists.value = response.items
    console.log('Playlists loaded:', response.items)
  } catch (error) {
    console.error('Failed to load playlists:', error)
  } finally {
    isLoading.value = false
  }
}

// async function playPlaylist(playlistId: string) {
//   try {
//     const device_id = localStorage.getItem('device_id')
//     if (!device_id) {
//       console.error('No device ID found')
//       return
//     }
//     await spotifyApi.player.startResumePlayback(device_id, `spotify:playlist:${playlistId}`)
//   } catch (error) {
//     console.error('Failed to play playlist:', error)
//   }
// }

onMounted(() => {
  loadPlaylists()
})
</script>

<template>
  <div class="playlists-view">
    <header class="page-header">
      <h1>播放列表</h1>
    </header>

    <div v-if="isLoading" class="loading-container">
      <LoadingSpinner text="正在加载播放列表..." />
    </div>

    <div v-else class="playlists-grid">
      <div
        v-for="playlist in playlists"
        :key="playlist.id"
        class="playlist-card"
        @click="router.push(`/playlist/${playlist.id}`)"
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
          <!-- <p>{{ playlist.tracks.total }} 首歌曲</p> -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.playlists-view {
  padding: 24px;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
}

.playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

.playlist-card {
  background: #181818;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.playlist-card:hover {
  background: #282828;
  transform: translateY(-4px);
}

.playlist-image {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  margin-bottom: 16px;
  border-radius: 4px;
  overflow: hidden;
}

.playlist-image img {
  position: absolute;
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
  transition: opacity 0.3s ease;
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
  transform: translateY(8px);
  transition: all 0.3s ease;
}

.playlist-card:hover .play-button {
  transform: translateY(0);
}

.play-button:hover {
  transform: scale(1.1);
  background: #1ed760;
}

.playlist-info h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-info p {
  font-size: 0.875rem;
  color: #b3b3b3;
  margin: 0;
}

@media (max-width: 768px) {
  .playlists-view {
    padding: 16px;
  }

  .playlists-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .playlist-card {
    padding: 12px;
  }

  .play-button {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
}
</style>
