<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { spotifyApi } from '@/config/spotifySDK'
import type { Category } from '@spotify/web-api-ts-sdk'
import SideNav from '@/components/SideNav.vue'
import Player from '@/components/MusicPlayer.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const categories = ref<Category[]>([])
const searchQuery = ref('')
const isLoading = ref(true)

async function loadCategories() {
  try {
    const response = await spotifyApi.browse.getCategories('US', 'EN', 50, 0)
    categories.value = response.categories.items
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

const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value
  return categories.value.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

onMounted(() => {
  loadCategories()
})
</script>

<template>
  <div class="app-layout">
    <SideNav />
    <div class="main-container">
      <div class="content">
        <header class="top-bar">
          <div class="header-content">
            <h1>探索音乐</h1>
            <div class="search-bar">
              <i class="fas fa-search search-icon"></i>
              <input v-model="searchQuery" type="text" placeholder="搜索音乐分类..." />
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
                v-for="category in filteredCategories"
                :key="category.id"
                class="category-card"
                @click="navigateToCategory(category.id)"
              >
                <div class="category-content">
                  <div class="category-image">
                    <img :src="category.icons[0]?.url" :alt="category.name" />
                  </div>
                  <div class="category-info">
                    <h3>{{ category.name }}</h3>
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

            <div v-if="filteredCategories.length === 0" class="no-results">
              <i class="fas fa-search"></i>
              <p>没有找到匹配的分类</p>
            </div>
          </div>
        </main>
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
}

.top-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(20px);
  background: linear-gradient(to bottom, rgba(26, 26, 26, 0.8), rgba(18, 18, 18, 0.8));
  padding: 24px 0;
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header-content h1 {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(to right, #fff, #b3b3b3);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 0;
}

.search-bar {
  max-width: 400px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #909090;
  font-size: 14px;
}

.search-bar input {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  padding: 14px 20px 14px 44px;
  border-radius: 24px;
  color: white;
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-bar input:focus {
  outline: none;
  background-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 2px rgba(29, 185, 84, 0.5);
}

.search-bar input::placeholder {
  color: #909090;
}

.main-content {
  padding: 20px 0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
  color: #b3b3b3;
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

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
  animation: fadeIn 0.5s ease;
}

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

.category-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  background: rgba(255, 255, 255, 0.1);
}

.category-content {
  position: relative;
  aspect-ratio: 4/3;
}

.category-image {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.category-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.category-card:hover .category-image img {
  transform: scale(1.1);
}

.category-info {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.category-info h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.category-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
}

.category-card:hover .category-overlay {
  opacity: 1;
}

.explore-btn {
  background: #1db954;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  transform: translateY(20px);
  opacity: 0;
}

.category-card:hover .explore-btn {
  transform: translateY(0);
  opacity: 1;
}

.explore-btn:hover {
  background: #1ed760;
  transform: scale(1.05) !important;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 16px;
  color: #b3b3b3;
  text-align: center;
}

.no-results i {
  font-size: 48px;
  opacity: 0.5;
}

@media (max-width: 768px) {
  .main-container {
    margin-left: 0;
    padding-bottom: 136px;
  }

  .content {
    padding: 0 16px 60px 16px;
  }

  .header-content h1 {
    font-size: 2rem;
  }

  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }

  .category-info h3 {
    font-size: 1.2rem;
  }

  .explore-btn {
    padding: 10px 20px;
    font-size: 13px;
  }
}
</style>
