<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { spotifyApi } from '@/config/spotifySDK'
import type { Category, Track } from '@spotify/web-api-ts-sdk'

const router = useRouter()
const categories = ref<Category[]>([])
const topTracks = ref<Track[]>([])
const isLoading = ref(true)

async function loadExploreData() {
  try {
    // 获取音乐分类
    const categoriesData = await spotifyApi.browse.getCategories('US',"US",12)
    categories.value = categoriesData.categories.items

    // 获取个人热门歌曲
    const topTracksData = await spotifyApi.currentUser.topItems("tracks", "medium_term", 12)
    topTracks.value = topTracksData.items
  } catch (error) {
    console.error('Failed to load explore data:', error)
  } finally {
    isLoading.value = false
  }
}

function navigateToCategory(categoryId: string) {
  router.push(`/category/${categoryId}`)
}

function formatArtists(track: Track): string {
  return track.artists.map(artist => artist.name).join(', ')
}

onMounted(() => {
  loadExploreData()
})
</script>

<template>
  <div class="explore-view">
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载内容...</p>
    </div>

    <template v-else>
      <!-- 音乐分类 -->
      <section class="categories-section">
        <h2>探索分类</h2>
        <div class="categories-grid">
          <div
            v-for="category in categories"
            :key="category.id"
            class="category-card"
            @click="navigateToCategory(category.id)"
          >
            <img :src="category.icons[0].url" :alt="category.name" />
            <h3>{{ category.name }}</h3>
          </div>
        </div>
      </section>

      <!-- 个性化推荐 -->
      <section class="recommendations-section">
        <h2>为你推荐</h2>
        <div class="tracks-grid">
          <div
            v-for="track in topTracks"
            :key="track.id"
            class="track-card"
            @click="router.push(`/album/${track.album.id}`)"
          >
            <div class="track-image">
              <img :src="track.album.images[0].url" :alt="track.name" />
              <div class="play-overlay">
                <i class="fas fa-play"></i>
              </div>
            </div>
            <div class="track-info">
              <h3>{{ track.name }}</h3>
              <p>{{ formatArtists(track) }}</p>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.explore-view {
  padding: 24px;
}

section {
  margin-bottom: 48px;
}

h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 24px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 24px;
}

.category-card {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
  aspect-ratio: 1;
}

.category-card:hover {
  transform: scale(1.05);
}

.category-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-card h3 {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  margin: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  font-size: 1.1rem;
}

.tracks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

.track-card {
  background: #181818;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.track-card:hover {
  background: #282828;
  transform: translateY(-4px);
}

.track-image {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  margin-bottom: 16px;
  border-radius: 4px;
  overflow: hidden;
}

.track-image img {
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

.track-card:hover .play-overlay {
  opacity: 1;
}

.play-overlay i {
  color: white;
  font-size: 2rem;
}

.track-info h3 {
  font-size: 1rem;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-info p {
  font-size: 0.875rem;
  color: #b3b3b3;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: #1db954;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .explore-view {
    padding: 16px;
  }

  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
  }

  .tracks-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }

  h2 {
    font-size: 1.5rem;
    margin-bottom: 16px;
  }
}
</style>
