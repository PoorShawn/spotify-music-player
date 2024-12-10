<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { spotifyApi } from '@/config/spotifySDK'
import type { SimplifiedAlbum } from '@spotify/web-api-ts-sdk'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'

const router = useRouter()
const albums = ref<SimplifiedAlbum[]>([])
const isLoading = ref(true)
const isLoadingMore = ref(false)
const hasMore = ref(true)
const hoveredAlbumId = ref<string | null>(null)
const scrollContainer = ref<HTMLElement | null>(null)

// 加载新专辑
async function loadNewReleases(offset = 0) {
  try {
    const response = await spotifyApi.browse.getNewReleases('US', 20, offset)
    if (offset === 0) {
      albums.value = response.albums.items
    } else {
      albums.value = [...albums.value, ...response.albums.items]
    }
    hasMore.value = response.albums.items.length === 20
  } catch (error) {
    console.error('Failed to load new releases:', error)
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

// 处理滚动加载
function handleScroll(event: Event) {
  const target = event.target as HTMLElement
  const { scrollTop, scrollHeight, clientHeight } = target
  const threshold = 100 // 距离底部100px时开始加载

  if (
    !isLoadingMore.value &&
    hasMore.value &&
    scrollHeight - scrollTop - clientHeight < threshold
  ) {
    loadMore()
  }
}

// 加载更多
async function loadMore() {
  if (isLoadingMore.value || !hasMore.value) return
  isLoadingMore.value = true
  await loadNewReleases(albums.value.length)
}

// 获取艺术家名字
function getArtistNames(album: SimplifiedAlbum): string {
  return album.artists.map((artist) => artist.name).join(', ')
}

// 获取专辑年份
function getAlbumYear(date: string): string {
  return new Date(date).getFullYear().toString()
}

onMounted(() => {
  loadNewReleases()
})
</script>

<template>
  <div class="content" @scroll="handleScroll" ref="scrollContainer">
    <LoadingSpinner v-if="isLoading" text="正在加载新专辑..." />

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

      <!-- 加载更多指示器 -->
      <LoadingSpinner v-if="isLoadingMore" text="加载更多精彩内容..." />

      <!-- 没有更多数据提示 -->
      <div v-if="!hasMore && !isLoadingMore" class="no-more">
        <i class="fas fa-check-circle"></i>
        <p>已经到底啦~</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.content {
  flex: 1;
  padding: 32px;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 8px;
  background: linear-gradient(to right, #fff, #b3b3b3);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.subtitle {
  color: #b3b3b3;
  font-size: 1rem;
}

.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

.album-card {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.album-card:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-4px);
}

.album-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
}

.album-image {
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
  cursor: pointer;
  transition: all 0.2s ease;
  transform: scale(0.8);
}

.play-overlay.show .play-button {
  transform: scale(1);
}

.play-button:hover {
  background: #1ed760;
  transform: scale(1.1) !important;
}

.album-info {
  padding: 16px;
}

.album-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-artist {
  color: #b3b3b3;
  font-size: 0.875rem;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-year {
  color: #686868;
  font-size: 0.75rem;
}

.no-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  color: #b3b3b3;
  gap: 12px;
  text-align: center;
}

.no-more i {
  font-size: 24px;
  opacity: 0.5;
}

@media (max-width: 768px) {
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

  .album-info {
    padding: 12px;
  }
}
</style>
