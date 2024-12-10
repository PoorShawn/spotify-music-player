<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps<{
  id: string
  name: string
  imageUrl?: string
}>()

function navigateToArtist() {
  router.push(`/artist/${props.id}`)
}
</script>

<template>
  <div class="card" @click="navigateToArtist">
    <div class="card-image-container">
      <div class="card-image" :style="imageUrl ? { backgroundImage: `url(${imageUrl})` } : {}">
        <div class="play-overlay">
          <i class="fas fa-play"></i>
        </div>
      </div>
    </div>
    <h3>{{ name }}</h3>
    <p>Artist</p>
  </div>
</template>

<style scoped>
.card {
  background-color: #181818;
  padding: 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.card:hover {
  background-color: #282828;
  transform: translateY(-8px);
}

.card-image-container {
  position: relative;
  margin-bottom: 16px;
  aspect-ratio: 1;
  border-radius: 50%;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  background-color: #282828;
  background-size: cover;
  background-position: center;
  transition: transform 0.3s ease;
}

.play-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  color: white;
  font-size: 24px;
}

.card:hover .play-overlay {
  opacity: 1;
}

.card:hover .card-image {
  transform: scale(1.1);
}

.card h3 {
  font-size: 1rem;
  margin-bottom: 8px;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card p {
  font-size: 0.875rem;
  color: #b3b3b3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
