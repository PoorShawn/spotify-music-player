<script setup lang="ts">
import { ref } from 'vue'
import { spotifyApi } from '@/config/spotifySDK'

const props = defineProps<{
  title: string
  description: string
  imageUrl?: string
  trackId: string
}>()

const isHovered = ref(false)

async function playTrack() {
  try {
    const device_id = localStorage.getItem('device_id')
    if (!device_id) {
      console.error('No device ID found')
      return
    }

    // 判断是否为播放列表
    if (props.trackId.length > 22) {
      // Spotify 播放列表 ID 通常更长
      await spotifyApi.player.startResumePlayback(device_id, `spotify:playlist:${props.trackId}`)
    } else {
      await spotifyApi.player.startResumePlayback(device_id, undefined, [
        `spotify:track:${props.trackId}`,
      ])
    }
  } catch (error) {
    console.error('Failed to play track:', error)
  }
}
</script>

<template>
  <div class="card" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    <div class="card-image-container">
      <div
        class="card-image"
        :style="imageUrl ? { backgroundImage: `url(${imageUrl})` } : {}"
      ></div>
      <button v-show="isHovered" class="play-button" @click.stop="playTrack">
        <i class="fas fa-play"></i>
      </button>
    </div>
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
  </div>
</template>

<style scoped>
.card {
  background-color: #181818;
  padding: 16px;
  border-radius: 8px;
  transition: background-color 0.3s;
  cursor: pointer;
}

.card:hover {
  background-color: #282828;
}

.card-image-container {
  position: relative;
  margin-bottom: 16px;
}

.card-image {
  width: 100%;
  aspect-ratio: 1;
  background-color: #282828;
  background-size: cover;
  background-position: center;
  border-radius: 4px;
}

.card h3 {
  font-size: 1rem;
  margin-bottom: 8px;
  color: white;
}

.card p {
  font-size: 0.875rem;
  color: #b3b3b3;
}

.play-button {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #1db954;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.play-button:hover {
  transform: scale(1.1);
  background-color: #1ed760;
}
</style>
