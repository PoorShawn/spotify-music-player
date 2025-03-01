<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { spotifyApi } from '@/config/spotifySDK'
import type { SimplifiedAlbum } from '@spotify/web-api-ts-sdk'
import { useRouter } from 'vue-router'

const router = useRouter()
const newReleases = ref<SimplifiedAlbum[]>([])
const searchQuery = ref('')
const isLoading = ref(true)

async function loadNewReleases() {
  try {
    const response = await spotifyApi.browse.getCategories();
    newReleases.value = response.albums.items
    console.log(newReleases.value);
    //categories.value = response.categories.items
  } catch (error) {
    console.error('Failed to load categories:', error)
  } finally {
    isLoading.value = false
  }
}

function navigateToCategory(categoryId: string) {
  if (!categoryId) {
    console.error('Invalid category ID')
    return
  }
  router.push(`/category/${categoryId}`)
}

// const filteredCategories = computed(() => {
//   if (!searchQuery.value) return categories.value
//   return categories.value.filter((category) =>
//     category.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
//   )
// })

onMounted(() => {
  loadNewReleases()
})
</script>

<template>
  <header class="top-bar">
    <div class="header-content">
      <h1>探索音乐</h1>
      <div class="search-container">
        <div class="search-bar">
          <i class="fas fa-search search-icon"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索音乐..."
            class="search-input"
          />
        </div>
      </div>
    </div>
  </header>

  <main class="main-content">
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载分类...</p>
    </div>

    <div v-else>
      <div class="categories-grid">
        <div
          v-for="album in newReleases"
          :key="album.id"
          class="category-card"
        >
          <!-- @click="navigateToCategory(category.id)" -->
        
          <div class="category-content">
            <div class="category-image">
              <img :src="album.images[0]?.url" :alt="album.name" loading="lazy" />
            </div>
            <div class="category-info">
              <h3>{{ album.name }}</h3>
              <div class="category-overlay">
                <button class="explore-btn">
                  <i class="fas fa-compass"></i>
                  探索
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- <div v-if="filteredCategories.length === 0" class="no-results">
        <i class="fas fa-search"></i>
        <p>没有找到匹配的分类</p>
      </div> -->
    </div>
  </main>
</template>

<style scoped>
.top-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(20px);
  background: linear-gradient(to bottom, rgba(26, 26, 26, 0.9), rgba(18, 18, 18, 0.9));
  padding: 20px 32px;
  margin-bottom: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.header-content h1 {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(to right, #fff, #b3b3b3);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 0;
  white-space: nowrap;
}

.search-container {
  flex: 1;
  max-width: 500px;
}

.search-bar {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #b3b3b3;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: none;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
}

.search-input::placeholder {
  color: #b3b3b3;
}

.main-content {
  padding: 0 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
  padding: 16px 0;
}

.category-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  transition:
    transform 0.3s ease,
    background-color 0.3s ease;
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.08);
}

.category-content {
  position: relative;
}

.category-image {
  aspect-ratio: 1;
  overflow: hidden;
}

.category-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.category-card:hover .category-image img {
  transform: scale(1.05);
}

.category-info {
  padding: 16px;
  position: relative;
}

.category-info h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
}

.category-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.category-card:hover .category-overlay {
  opacity: 1;
}

.explore-btn {
  background: #1db954;
  color: white;
  border: none;
  padding: 8px 24px;
  border-radius: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease;
}

.explore-btn:hover {
  background: #1ed760;
  transform: scale(1.05);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
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

.no-results {
  text-align: center;
  padding: 48px 0;
  color: #b3b3b3;
}

.no-results i {
  font-size: 48px;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .header-content h1 {
    text-align: center;
  }

  .search-container {
    max-width: 100%;
  }

  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }
}
</style>
