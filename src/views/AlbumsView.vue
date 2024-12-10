<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { spotifyApi } from '@/config/spotifySDK'
import type { SimplifiedAlbum } from '@spotify/web-api-ts-sdk'
import SideNav from '@/components/SideNav.vue'
import Player from '@/components/MusicPlayer.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const albums = ref<SimplifiedAlbum[]>([])
const isLoading = ref(true)
const hoveredAlbumId = ref<string | null>(null)

// 分页相关状态
const currentPage = ref(0)
const itemsPerPage = 20
const hasMore = ref(true)
const isLoadingMore = ref(false)

// 计算发行年份
const getAlbumYear = (date: string) => new Date(date).getFullYear()

// 获取艺术家名字
const getArtistNames = (album: SimplifiedAlbum) => {
  return album.artists.map((artist) => artist.name).join(', ')
}

async function loadNewReleases(page = 0) {
  try {
    isLoadingMore.value = true
    const offset = page * itemsPerPage

    const response = await spotifyApi.browse.getNewReleases('US', itemsPerPage, offset)

    if (page === 0) {
      albums.value = response.albums.items
    } else {
      albums.value = [...albums.value, ...response.albums.items]
    }

    // 检查是否还有更多数据
    hasMore.value = response.albums.items.length === itemsPerPage
    currentPage.value = page
  } catch (error) {
    console.error('Failed to load new releases:', error)
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

async function loadMore() {
  if (!hasMore.value || isLoadingMore.value) return
  await loadNewReleases(currentPage.value + 1)
}

// 监听滚动事件
function handleScroll(e: Event) {
  const element = e.target as HTMLElement
  const scrollPosition = element.scrollTop + element.clientHeight
  const threshold = element.scrollHeight - 100 // 距离底部100px时加载更多

  if (scrollPosition >= threshold) {
    loadMore()
  }
}

// 播放专辑
async function playAlbum(albumId: string) {
  try {
    const device_id = localStorage.getItem('device_id')
    if (!device_id) return
    await spotifyApi.player.startResumePlayback(device_id, `spotify:album:${albumId}`)
  } catch (error) {
    console.error('Failed to play album:', error)
  }
}

onMounted(() => {
  loadNewReleases()
})
</script>

<template>
  <div class="app-layout">
    <SideNav />
    <div class="main-container">
      <div class="content" @scroll="handleScroll" ref="scrollContainer">
        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>正在加载新专辑...</p>
        </div>

        <template v-else>
          <header class="page-header">
            <h1>新专辑发行</h1>
            <p class="subtitle">发现最新音乐</p>
          </header>

          <div class="albums-grid">
            <div
              v-for="album in albums"
              :key="album.id"
              class="album-card"
              @mouseenter="hoveredAlbumId = album.id"
              @mouseleave="hoveredAlbumId = null"
              @click="router.push(`/album/${album.id}`)"
            >
              <div class="album-image-container">
                <img :src="album.images[0]?.url" :alt="album.name" class="album-image" />
                <div class="play-overlay" :class="{ show: hoveredAlbumId === album.id }">
                  <button class="play-button">
                    <i class="fas fa-play"></i>
                  </button>
                </div>
              </div>
              <div class="album-info">
                <h3 class="album-title">{{ album.name }}</h3>
                <p class="album-artist">{{ getArtistNames(album) }}</p>
                <span class="album-year">{{ getAlbumYear(album.release_date) }}</span>
              </div>
            </div>
          </div>

          <!-- 加载更多指示器 - 优化样式 -->
          <div v-if="isLoadingMore" class="loading-more">
            <div class="loading-spinner"></div>
            <p>加载更多精彩内容...</p>
          </div>

          <!-- 没有更多数据提示 - 优化样式 -->
          <div v-if="!hasMore && !isLoadingMore" class="no-more">
            <i class="fas fa-check-circle"></i>
            <p>已经到底啦~</p>
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
}

.content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
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
}

.content:hover::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
}

.page-header {
  margin-bottom: 40px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 8px;
  background: linear-gradient(to right, #fff, #b3b3b3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  color: #b3b3b3;
  font-size: 1.1rem;
}

.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
  animation: fadeIn 0.5s ease;
}

.album-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.album-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-8px);
}

.album-image-container {
  position: relative;
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1;
}

.album-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.album-card:hover .album-image {
  transform: scale(1.05);
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

.play-overlay.show {
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
  transform: translateY(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.play-overlay.show .play-button {
  transform: translateY(0);
}

.play-button:hover {
  transform: scale(1.1);
  background: #1ed760;
}

.album-info {
  padding: 8px 4px;
}

.album-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-artist {
  color: #b3b3b3;
  font-size: 0.875rem;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-year {
  color: #686868;
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .main-container {
    margin-left: 0;
  }

  .content {
    padding: 16px;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .albums-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }
}

.loading-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  color: #b3b3b3;
  gap: 12px;
}

.loading-more .loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #1db954;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.no-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  color: #b3b3b3;
  gap: 8px;
}

.no-more i {
  font-size: 24px;
  color: #1db954;
}

.no-more p {
  font-size: 0.9rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 添加加载动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.albums-grid {
  animation: fadeIn 0.5s ease;
}
</style>
