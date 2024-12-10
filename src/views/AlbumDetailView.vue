<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { spotifyApi } from '@/config/spotifySDK'
import type { Album, SimplifiedTrack } from '@spotify/web-api-ts-sdk'
import SideNav from '@/components/SideNav.vue'
import Player from '@/components/MusicPlayer.vue'

const route = useRoute()
const album = ref<Album | null>(null)
const tracks = ref<SimplifiedTrack[]>([])
const isLoading = ref(true)
const currentPlayingTrackId = ref<string | null>(null)
const isPlaying = ref(false)
const hoveredTrackId = ref<string | null>(null)

// 格式化时长
function formatDuration(ms: number) {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// 计算总时长
const totalDuration = computed(() => {
  if (!tracks.value.length) return '0:00'
  const totalMs = tracks.value.reduce((acc, track) => acc + track.duration_ms, 0)
  return formatDuration(totalMs)
})

// 获取年份
const releaseYear = computed(() => {
  if (!album.value?.release_date) return ''
  return new Date(album.value.release_date).getFullYear()
})

// 获取艺术家名字
const artistNames = computed(() => {
  return album.value?.artists.map((artist) => artist.name).join(', ') || ''
})

async function loadAlbumData() {
  try {
    const albumId = route.params.id as string
    const [albumData, tracksData] = await Promise.all([
      spotifyApi.albums.get(albumId),
      spotifyApi.albums.tracks(albumId),
    ])

    album.value = albumData
    const fullTracks = await Promise.all(
      tracksData.items.map((track) => spotifyApi.tracks.get(track.id)),
    )
    tracks.value = fullTracks
  } catch (error) {
    console.error('Failed to load album data:', error)
  } finally {
    isLoading.value = false
  }
}

// 播放单曲
async function playTrack(track: SimplifiedTrack) {
  try {
    const device_id = localStorage.getItem('device_id')
    if (!device_id) {
      console.error('No device ID found')
      return
    }

    if (currentPlayingTrackId.value === track.id && isPlaying.value) {
      await spotifyApi.player.pausePlayback(device_id)
      isPlaying.value = false
    } else {
      await spotifyApi.player.startResumePlayback(device_id, undefined, [
        `spotify:track:${track.id}`,
      ])
      currentPlayingTrackId.value = track.id
      isPlaying.value = true
    }
  } catch (error) {
    console.error('Failed to play track:', error)
  }
}

// 播放整张专辑
async function playAlbum() {
  try {
    const device_id = localStorage.getItem('device_id')
    if (!device_id || !album.value) {
      console.error('No device ID or album found')
      return
    }

    if (isPlaying.value && tracks.value.some((track) => track.id === currentPlayingTrackId.value)) {
      await spotifyApi.player.pausePlayback(device_id)
      isPlaying.value = false
    } else {
      await spotifyApi.player.startResumePlayback(device_id, `spotify:album:${album.value.id}`)
      if (tracks.value.length > 0) {
        currentPlayingTrackId.value = tracks.value[0].id
        isPlaying.value = true
      }
    }
  } catch (error) {
    console.error('Failed to play album:', error)
  }
}

// 在 Spotify 中打开
function openInSpotify() {
  if (album.value?.external_urls.spotify) {
    window.open(album.value.external_urls.spotify, '_blank')
  }
}

// 添加检查当前播放状态的函数
async function checkCurrentPlayback() {
  try {
    const playbackState = await spotifyApi.player.getPlaybackState()
    if (playbackState && playbackState.item) {
      isPlaying.value = playbackState.is_playing
      currentPlayingTrackId.value = playbackState.item.id
    }
  } catch (error) {
    console.error('Failed to check playback:', error)
  }
}

onMounted(() => {
  loadAlbumData()
  checkCurrentPlayback()
  setInterval(checkCurrentPlayback, 1000)
})
</script>

<template>
  <div class="app-layout">
    <SideNav />
    <div class="main-container">
      <div class="content">
        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>正在加载专辑信息...</p>
        </div>

        <template v-else>
          <div
            class="album-header"
            :style="album?.images[0]?.url ? { backgroundImage: `url(${album.images[0].url})` } : {}"
          >
            <div class="header-content">
              <img :src="album?.images[0]?.url" :alt="album?.name" class="album-cover" />
              <div class="album-info">
                <span class="album-type">{{ album?.album_type?.toUpperCase() }}</span>
                <h1>{{ album?.name }}</h1>
                <div class="album-meta">
                  <img
                    v-if="album?.images[2]?.url"
                    :src="album.images[2].url"
                    class="artist-avatar"
                    :alt="artistNames"
                  />
                  <span class="artist-name">{{ artistNames }}</span>
                  <span class="dot">•</span>
                  <span>{{ releaseYear }}</span>
                  <span class="dot">•</span>
                  <span>{{ album?.total_tracks }} 首歌曲</span>
                  <span class="dot">•</span>
                  <span>{{ totalDuration }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="album-content">
            <div class="actions">
              <button class="play-btn" @click="playAlbum">
                <i
                  class="fas"
                  :class="
                    isPlaying && tracks.some((track) => track.id === currentPlayingTrackId)
                      ? 'fa-pause'
                      : 'fa-play'
                  "
                ></i>
              </button>
              <button class="spotify-btn" @click="openInSpotify">
                <i class="fab fa-spotify"></i>
                在 Spotify 打开
              </button>
            </div>

            <div class="tracks-list">
              <div class="tracks-header">
                <div class="header-row">
                  <span class="track-number">#</span>
                  <span class="track-title">标题</span>
                  <span class="track-duration">
                    <i class="far fa-clock"></i>
                  </span>
                </div>
              </div>

              <div class="tracks-body">
                <div
                  v-for="(track, index) in tracks"
                  :key="track.id"
                  class="track-row"
                  :class="{ playing: currentPlayingTrackId === track.id }"
                  @mouseenter="hoveredTrackId = track.id"
                  @mouseleave="hoveredTrackId = null"
                  @click="playTrack(track)"
                >
                  <span class="track-number">
                    <template v-if="currentPlayingTrackId === track.id">
                      <i class="fas" :class="isPlaying ? 'fa-volume-up' : 'fa-pause'"></i>
                    </template>
                    <template v-else-if="hoveredTrackId === track.id">
                      <i class="fas fa-play"></i>
                    </template>
                    <template v-else>
                      {{ index + 1 }}
                    </template>
                  </span>
                  <div class="track-title">
                    <span
                      class="track-name"
                      :class="{ 'text-success': currentPlayingTrackId === track.id }"
                    >
                      {{ track.name }}
                    </span>
                    <span class="track-artists">
                      {{ track.artists.map((artist) => artist.name).join(', ') }}
                    </span>
                  </div>
                  <span class="track-duration">{{ formatDuration(track.duration_ms) }}</span>
                </div>
              </div>
            </div>
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
  margin-left: 0px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 100px;
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

.album-header {
  position: relative;
  padding: 24px;
  margin-bottom: 32px;
  min-height: 400px;
  display: flex;
  align-items: flex-end;
  background-size: cover;
  background-position: center;
}

.album-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(to bottom, transparent, #121212);
}

.header-content {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 24px;
  align-items: flex-end;
  width: 100%;
}

.album-cover {
  width: 232px;
  height: 232px;
  box-shadow: 0 4px 60px rgba(0, 0, 0, 0.5);
  border-radius: 4px;
}

.album-info {
  flex: 1;
}

.album-type {
  font-size: 0.875rem;
  font-weight: 700;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.album-info h1 {
  font-size: 6rem;
  font-weight: 700;
  margin: 8px 0;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  line-height: 1;
}

.album-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-size: 0.875rem;
}

.artist-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.artist-name {
  font-weight: 700;
}

.dot {
  color: #b3b3b3;
}

.album-content {
  padding: 0 24px;
}

.actions {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 32px;
}

.play-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #1db954;
  border: none;
  color: white;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-btn:hover {
  transform: scale(1.05);
  background-color: #1ed760;
}

.spotify-btn {
  height: 32px;
  padding: 0 16px;
  border-radius: 16px;
  border: none;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.spotify-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.02);
}

.tracks-list {
  margin-top: 24px;
}

.tracks-header {
  padding: 0 16px;
  height: 36px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-row {
  display: grid;
  grid-template-columns: 48px 1fr 120px;
  align-items: center;
  color: #b3b3b3;
  font-size: 0.875rem;
  font-weight: 400;
  height: 100%;
}

.tracks-body .track-row {
  display: grid;
  grid-template-columns: 48px 1fr 120px;
  align-items: center;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.track-row:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.track-row.playing {
  background-color: rgba(29, 185, 84, 0.1);
}

.track-number {
  color: #b3b3b3;
  font-size: 1rem;
  width: 32px;
  text-align: center;
}

.track-title {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.track-name {
  color: #fff;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-name.text-success {
  color: #1db954;
}

.track-artists {
  color: #b3b3b3;
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-duration {
  color: #b3b3b3;
  font-size: 0.875rem;
  text-align: right;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: #fff;
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
  .main-container {
    margin-left: 0;
    padding-bottom: 136px;
  }

  .album-header {
    padding: 16px;
    min-height: 300px;
  }

  .header-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .album-cover {
    width: 192px;
    height: 192px;
  }

  .album-info h1 {
    font-size: 3rem;
  }

  .album-meta {
    flex-wrap: wrap;
    justify-content: center;
  }

  .album-content {
    padding: 0 16px;
  }

  .actions {
    justify-content: center;
  }

  .play-btn {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }
}
</style>
