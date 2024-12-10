<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { spotifyApi } from '@/config/spotifySDK'
import type { Artist, Track } from '@spotify/web-api-ts-sdk'
import SideNav from '@/components/SideNav.vue'
import Player from '@/components/MusicPlayer.vue'

const route = useRoute()
const artist = ref<Artist | null>(null)
const popularTracks = ref<Track[]>([])
const currentPlayingTrackId = ref<string | null>(null)

async function loadArtistData() {
  try {
    const artistId = route.params.id as string
    artist.value = await spotifyApi.artists.get(artistId)
    const topTracks = await spotifyApi.artists.topTracks(artistId, 'US')
    popularTracks.value = topTracks.tracks
  } catch (error) {
    console.error('Failed to load artist data:', error)
  }
}

// 监听当前播放状态
async function checkCurrentPlayback() {
  try {
    const playbackState = await spotifyApi.player.getPlaybackState()
    if (playbackState && playbackState.item) {
      currentPlayingTrackId.value = playbackState.item.id
    }
  } catch (error) {
    console.error('Failed to get playback state:', error)
  }
}

onMounted(() => {
  loadArtistData()
  checkCurrentPlayback()
  // 定期检查播放状态
  setInterval(checkCurrentPlayback, 1000)
})

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// 播放功能
async function playTrack(track: Track) {
  try {
    const device_id = localStorage.getItem('device_id')
    if (!device_id) {
      console.error('No device ID found')
      return
    }

    await spotifyApi.player.startResumePlayback(device_id, undefined, [`spotify:track:${track.id}`])
    currentPlayingTrackId.value = track.id
  } catch (error) {
    console.error('Failed to play track:', error)
  }
}

// 播放艺术家全部热门歌曲
async function playAllTracks() {
  try {
    const device_id = localStorage.getItem('device_id')
    if (!device_id) {
      console.error('No device ID found')
      return
    }

    const trackUris = popularTracks.value.map((track) => `spotify:track:${track.id}`)
    await spotifyApi.player.startResumePlayback(device_id, undefined, trackUris)
    if (popularTracks.value.length > 0) {
      currentPlayingTrackId.value = popularTracks.value[0].id
    }
  } catch (error) {
    console.error('Failed to play tracks:', error)
  }
}

// 在 Spotify 中打开
function openInSpotify() {
  if (artist.value?.external_urls.spotify) {
    window.open(artist.value.external_urls.spotify, '_blank')
  }
}

const monthlyListeners = computed(() => {
  if (!artist.value?.followers?.total) return '0'
  return (artist.value.followers.total / 1000000).toFixed(1) + 'M'
})
</script>

<template>
  <div class="app-layout">
    <SideNav />
    <div class="main-container">
      <div class="content">
        <!-- 艺术家头部信息 -->
        <div class="artist-header" v-if="artist">
          <div
            class="artist-banner"
            :style="
              artist.images?.[0]?.url ? { backgroundImage: `url(${artist.images[0].url})` } : {}
            "
          ></div>
          <div class="artist-info">
            <div class="verified-badge">
              <i class="fas fa-check-circle"></i>
              <span>Verified Artist</span>
            </div>
            <h1>{{ artist.name }}</h1>
            <div class="stats">
              <div class="monthly-listeners">{{ monthlyListeners }} monthly listeners</div>
              <div class="genres" v-if="artist.genres?.length">
                <span v-for="genre in artist.genres.slice(0, 3)" :key="genre" class="genre-tag">
                  {{ genre }}
                </span>
              </div>
            </div>
            <div class="actions">
              <button
                class="play-btn"
                @click="playAllTracks"
                :class="{ playing: currentPlayingTrackId }"
              >
                <i class="fas" :class="currentPlayingTrackId ? 'fa-pause' : 'fa-play'"></i>
              </button>
              <button class="spotify-btn" @click="openInSpotify">
                <i class="fab fa-spotify"></i>
                Open in Spotify
              </button>
              <button class="follow-btn">
                <i class="fas fa-heart"></i>
                Follow
              </button>
            </div>
          </div>
        </div>

        <!-- 热门歌曲列表 -->
        <section class="popular-tracks">
          <h2>Popular</h2>
          <div class="tracks-list">
            <div
              v-for="(track, index) in popularTracks"
              :key="track.id"
              class="track-item"
              :class="{ playing: currentPlayingTrackId === track.id }"
              @click="playTrack(track)"
            >
              <div class="track-index">
                <span class="number">{{ index + 1 }}</span>
                <img
                  src="/images/playing.gif"
                  class="playing-gif"
                  v-if="currentPlayingTrackId === track.id"
                />
              </div>
              <div class="track-image">
                <img :src="track.album.images[0]?.url" :alt="track.name" />
                <div class="play-overlay">
                  <i
                    class="fas"
                    :class="currentPlayingTrackId === track.id ? 'fa-pause' : 'fa-play'"
                  ></i>
                </div>
              </div>
              <div class="track-info">
                <div class="track-name">{{ track.name }}</div>
                <div class="track-album">{{ track.album.name }}</div>
              </div>
              <div class="track-duration">{{ formatDuration(track.duration_ms) }}</div>
            </div>
          </div>
        </section>
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
  padding: 0 0 100px 0;
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

.artist-header {
  position: relative;
  padding: 24px;
  margin-bottom: 32px;
  min-height: 400px;
  display: flex;
  align-items: flex-end;
}

.artist-banner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background-size: cover;
  background-position: center 30%;
  filter: brightness(0.6);
  z-index: 0;
}

.artist-banner::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(to bottom, transparent, #121212);
}

.artist-info {
  position: relative;
  z-index: 1;
  width: 100%;
}

.verified-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1db954;
  font-size: 0.875rem;
  margin-bottom: 8px;
}

.verified-badge i {
  font-size: 1.2em;
}

.artist-info h1 {
  font-size: 6rem;
  font-weight: 700;
  margin: 8px 0;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  line-height: 1;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.monthly-listeners {
  font-size: 1rem;
  color: #fff;
}

.genres {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.genre-tag {
  padding: 4px 12px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  font-size: 0.875rem;
  color: #fff;
}

.actions {
  display: flex;
  gap: 16px;
  align-items: center;
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

.play-btn.playing {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(29, 185, 84, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(29, 185, 84, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(29, 185, 84, 0);
  }
}

.spotify-btn,
.follow-btn {
  height: 32px;
  padding: 0 16px;
  border-radius: 16px;
  border: none;
  color: white;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.spotify-btn {
  background-color: rgba(255, 255, 255, 0.1);
}

.follow-btn {
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.spotify-btn:hover,
.follow-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.02);
}

.popular-tracks {
  padding: 0 24px;
}

.popular-tracks h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 24px;
}

.tracks-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.track-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.track-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.track-item.playing {
  background-color: rgba(29, 185, 84, 0.1);
}

.track-index {
  width: 40px;
  text-align: center;
  color: #b3b3b3;
  font-size: 0.875rem;
  position: relative;
}

.track-index .number {
  opacity: 1;
  transition: opacity 0.2s ease;
}

.track-item:hover .track-index .number,
.track-item.playing .track-index .number {
  opacity: 0;
}

.playing-gif {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
}

.track-image {
  position: relative;
  width: 40px;
  height: 40px;
  margin-right: 16px;
}

.track-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.play-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  border-radius: 4px;
}

.track-item:hover .play-overlay {
  opacity: 1;
}

.track-info {
  flex: 1;
  min-width: 0;
}

.track-name {
  color: white;
  font-size: 0.875rem;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-album {
  color: #b3b3b3;
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-duration {
  color: #b3b3b3;
  font-size: 0.875rem;
  margin-left: 16px;
}

@media (max-width: 768px) {
  .main-container {
    margin-left: 0;
    padding-bottom: 136px;
  }

  .artist-header {
    padding: 16px;
    min-height: 300px;
  }

  .artist-info h1 {
    font-size: 3rem;
  }

  .popular-tracks {
    padding: 0 16px;
  }

  .play-btn {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }

  .genre-tag {
    font-size: 0.75rem;
    padding: 3px 10px;
  }
}
</style>
