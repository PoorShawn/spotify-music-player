<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { spotifyApi } from '@/config/spotifySDK'
import { type UserProfile, type PlayHistory, type Track, SpotifyApi } from '@spotify/web-api-ts-sdk'
import AlbumCard from '@/components/AlbumCard.vue'
import ArtistCard from '@/components/ArtistCard.vue'

const router = useRouter()
const userProfile = ref<UserProfile | null>(null)
const userProfileRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const isDropdownVisible = ref(false)
const recentlyPlayed = ref<PlayHistory[]>([])
const recommendedArtists = ref<Array<{ id: string; name: string; imageUrl?: string }>>([])
const recommendedTracks = ref<Track[]>([])

// 处理点击事件,进行用户头像的下拉菜单的显示和隐藏
function handleGlobalClick(event: MouseEvent) {
  if (!userProfileRef.value || !dropdownRef.value) return

  const target = event.target as HTMLElement
  if (!userProfileRef.value.contains(target) && !dropdownRef.value.contains(target)) {
    isDropdownVisible.value = false
  }
}

async function loadUserProfile() {
  try {
    userProfile.value = await spotifyApi.currentUser.profile()
  } catch (error) {
    console.error('Failed to load user profile:', error)
    router.push('/login')
  }
}

async function handleLogout() {
  try {
    localStorage.removeItem('device_id')
    localStorage.removeItem('spotify-sdk:AuthorizationCodeWithPKCEStrategy:token')
    router.push('/login')
  } catch (error) {
    console.error('Failed to logout:', error)
  }
}

function toggleDropdown() {
  isDropdownVisible.value = !isDropdownVisible.value
}

async function loadRecommendedTracks() {
  try {
    if (recommendedArtists.value.length > 0) {
      const tracksPromises = recommendedArtists.value.map((artist) =>
        spotifyApi.artists.topTracks(artist.id, 'US'),
      )
      const topTracksResults = await Promise.all(tracksPromises)
      const allTracks = topTracksResults.flatMap((result) => result.tracks.slice(0, 3))
      recommendedTracks.value = allTracks.slice(0, 10)
      console.log('Recommended Tracks:', recommendedTracks.value)
    }
  } catch (error) {
    console.error('Failed to load recommended tracks:', error)
  }
}

async function loadRecentlyPlayed() {
  try {
    const response = await spotifyApi.player.getRecentlyPlayedTracks(20)
    const uniqueTracksMap = new Map()
    for (const item of response.items) {
      if (!uniqueTracksMap.has(item.track.id)) {
        uniqueTracksMap.set(item.track.id, item)
      }
    }
    recentlyPlayed.value = Array.from(uniqueTracksMap.values()).slice(0, 10)

    const artistsMap = new Map()
    for (const item of response.items) {
      for (const artist of item.track.artists) {
        if (!artistsMap.has(artist.id)) {
          artistsMap.set(artist.id, {
            id: artist.id,
            name: artist.name,
          })
        }
      }
    }

    const artistIds = Array.from(artistsMap.keys())
    if (artistIds.length > 0) {
      const artistsInfo = await spotifyApi.artists.get(artistIds)
      recommendedArtists.value = artistsInfo.slice(0, 10).map((artist) => ({
        id: artist.id,
        name: artist.name,
        imageUrl: artist.images[0]?.url,
      }))
      console.log('Recommended Artists:', recommendedArtists.value);

      await loadRecommendedTracks();
    }
  } catch (error) {
    console.error('Failed to load recently played tracks:', error)
  }
}

// function loadPlaylists() {
//   try {
//     const response = spotifyApi.currentUser.playlists;
//     console.log('Playlists:', response)
//   } catch (error) {
//     console.error('Failed to load playlists:', error)
//   }

// }

onMounted(() => {
  loadUserProfile()
  loadRecentlyPlayed()
  window.addEventListener('click', handleGlobalClick)
})

onUnmounted(() => {
  window.removeEventListener('click', handleGlobalClick)
})
</script>

<template>
  <!-- 顶部搜索栏 -->
  <header class="top-bar">
    <div class="search-bar">
      <input type="text" placeholder="What do you want to listen to?" />
    </div>
    <div
      ref="userProfileRef"
      class="user-profile"
      v-if="userProfile"
      @click.stop="toggleDropdown"
    >
      <img :src="userProfile.images[0]?.url" :alt="userProfile.display_name" />

      <div
        ref="dropdownRef"
        class="user-dropdown"
        v-show="isDropdownVisible"
      >
        <div class="dropdown-header">
          <img :src="userProfile.images[0]?.url" :alt="userProfile.display_name" />
          <div class="user-info">
            <h4>{{ userProfile.display_name }}</h4>
            <p>{{ userProfile.email }}</p>
          </div>
        </div>
        <div class="dropdown-divider"></div>
        <button class="dropdown-item" @click="handleLogout">
          <i class="fas fa-sign-out-alt"></i>
          登出
        </button>
      </div>
    </div>
  </header>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <section>
      <h2>Recently played</h2>
      <div class="scroll-container">
        <div class="card-row">
          <AlbumCard
            v-for="item in recentlyPlayed"
            :key="item.track.id"
            :title="item.track.name"
            :description="item.track.artists[0].name"
            :imageUrl="item.track.album.images[0]?.url"
            :trackId="item.track.id"
          />
        </div>
        <div class="scroll-indicator">
          <i class="fas fa-chevron-right"></i>
        </div>
      </div>
    </section>

    <section>
      <h2>Recommended for you</h2>
      <div class="scroll-container">
        <div class="card-row">
          <AlbumCard
            v-for="track in recommendedTracks"
            :key="track.id"
            :title="track.name"
            :description="track.artists[0].name"
            :imageUrl="track.album.images[0]?.url"
            :trackId="track.id"
          />
        </div>
        <div class="scroll-indicator">
          <i class="fas fa-chevron-right"></i>
        </div>
      </div>
    </section>

    <section>
      <h2>Artist for you</h2>
      <div class="scroll-container">
        <div class="card-row">
          <ArtistCard
            v-for="artist in recommendedArtists"
            :key="artist.id"
            :id="artist.id"
            :name="artist.name"
            :imageUrl="artist.imageUrl"
          />
        </div>
        <div class="scroll-indicator">
          <i class="fas fa-chevron-right"></i>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.top-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(20px);
  padding: 16px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.search-bar {
  flex: 1;
  max-width: 400px;
  position: relative;
}

.search-bar::before {
  content: '\f002';
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #909090;
  font-size: 14px;
  pointer-events: none;
}

.search-bar input {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  padding: 12px 20px 12px 44px;
  border-radius: 24px;
  color: white;
  font-size: 14px;
  transition: all 0.2s ease;
}

.search-bar input:focus {
  outline: none;
  background-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 2px rgba(29, 185, 84, 0.5);
}

.search-bar input::placeholder {
  color: #909090;
}

.user-profile {
  margin-left: 16px;
  position: relative;
}

.user-profile img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.user-profile img:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 48px;
}

section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  padding: 0 4px;
}

.scroll-container {
  position: relative;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
  padding: 4px;
  margin: -4px;
}

.scroll-container::-webkit-scrollbar {
  height: 8px;
}

.scroll-container::-webkit-scrollbar-track {
  background: transparent;
  margin: 0 4px;
}

.scroll-container::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.scroll-container:hover::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
}

.card-row {
  display: flex;
  gap: 24px;
  padding: 4px 0;
}

.card-row > * {
  flex: 0 0 200px;
  transition: all 0.3s ease;
}

.scroll-container::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 120px;
  background: linear-gradient(to right, rgba(18, 18, 18, 0), #121212);
  pointer-events: none;
  opacity: 0.98;
}

.scroll-indicator {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: all 0.3s ease;
  cursor: pointer;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.scroll-container:hover .scroll-indicator {
  opacity: 1;
}

.scroll-indicator:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.card-row > *:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .main-container {
    margin-left: 0;
    padding-bottom: 136px;
  }

  .content {
    padding: 0 16px 60px 16px;
  }

  .top-bar {
    padding: 12px 16px;
    margin-bottom: 24px;
    background: linear-gradient(to bottom, rgba(26, 26, 26, 0.95), rgba(18, 18, 18, 0.9));
  }

  .search-bar {
    max-width: none;
  }

  .search-bar input {
    font-size: 13px;
    padding: 10px 16px 10px 40px;
  }

  .search-bar::before {
    left: 14px;
    font-size: 13px;
  }

  .user-profile img {
    width: 32px;
    height: 32px;
  }

  .main-content {
    gap: 32px;
  }

  section {
    gap: 16px;
  }

  h2 {
    font-size: 1.5rem;
  }

  .card-row > * {
    flex: 0 0 160px;
  }

  .scroll-container::after {
    width: 60px;
  }

  :deep(.music-player) {
    height: 80px;
    padding: 8px 16px;
    background-color: rgba(18, 18, 18, 0.98);
    backdrop-filter: blur(10px);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    bottom: 56px;
    z-index: 1000;
  }

  :deep(.track-info) {
    gap: 8px;
  }

  :deep(.track-image) {
    width: 48px;
    height: 48px;
  }

  :deep(.track-details h4) {
    font-size: 0.85rem;
  }

  :deep(.track-details p) {
    font-size: 0.75rem;
  }

  :deep(.player-controls) {
    gap: 4px;
  }

  :deep(.controls) {
    gap: 12px;
  }

  :deep(.control-btn) {
    font-size: 14px;
  }

  :deep(.control-btn.play) {
    width: 28px;
    height: 28px;
  }

  :deep(.progress-container) {
    padding: 0 8px;
  }

  :deep(.time) {
    font-size: 10px;
    min-width: 32px;
  }
}

/* 添加下拉菜单样式 */
.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 240px;
  background-color: #282828;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  z-index: 1000;
}

.dropdown-header {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #333;
}

.dropdown-header img {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}

.user-info h4 {
  margin: 0;
  color: white;
  font-size: 0.9rem;
}

.user-info p {
  margin: 4px 0 0;
  color: #b3b3b3;
  font-size: 0.8rem;
}

.dropdown-divider {
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 0;
}

.dropdown-item {
  width: 100%;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: none;
  border: none;
  color: #fff;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.dropdown-item i {
  font-size: 1rem;
  color: #b3b3b3;
}
</style>
