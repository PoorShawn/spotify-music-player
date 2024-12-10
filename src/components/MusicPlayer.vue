<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { spotifyApi } from '@/config/spotifySDK'

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Spotify: any
  }
}

const currentTime = ref('00:00')
const duration = ref('00:00')
const progress = ref(0)
const isPlaying = ref(false)
const currentTrack = ref({
  name: '',
  artist: '',
  imageUrl: '',
})

const transferPlayback = async (device_id: string) => {
  try {
    const tokenData = JSON.parse(
      localStorage.getItem('spotify-sdk:AuthorizationCodeWithPKCEStrategy:token') || '{}',
    )
    const access_token = tokenData?.access_token

    const response = await fetch('https://api.spotify.com/v1/me/player', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        device_ids: [device_id],
        // 设置 play 为 true 以确保在转移后自动开始播放
        play: true,
      }),
    })

    if (!response.ok && response.status !== 204) {
      throw new Error('Failed to transfer playback')
    }

    console.log('Playback transferred successfully')
  } catch (error) {
    console.error('Error transferring playback:', error)
  }
}

const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const setupPlayerStateListener = (player: any) => {
  player.addListener('player_state_changed', (state: any) => {
    if (!state) return

    isPlaying.value = !state.paused
    const track = state.track_window.current_track

    const imageUrl = track.album.images[0]?.url
    currentTrack.value = {
      name: track.name,
      artist: track.artists[0].name,
      imageUrl: imageUrl,
    }

    currentTime.value = formatTime(state.position)
    duration.value = formatTime(state.duration)
    progress.value = (state.position / state.duration) * 100

    if (isPlaying.value) {
      startProgressInterval(state.position, state.duration)
    }
  })
}

let progressInterval: number | undefined

const startProgressInterval = (startPosition: number, totalDuration: number) => {
  if (progressInterval) {
    clearInterval(progressInterval)
  }

  let currentPosition = startPosition
  const startTime = Date.now()

  progressInterval = window.setInterval(() => {
    if (!isPlaying.value) {
      clearInterval(progressInterval)
      return
    }

    const elapsed = Date.now() - startTime
    currentPosition = startPosition + elapsed

    if (currentPosition >= totalDuration) {
      clearInterval(progressInterval)
      return
    }

    currentTime.value = formatTime(currentPosition)
    progress.value = (currentPosition / totalDuration) * 100
  }, 1000)
}

const handleProgressClick = async (event: MouseEvent) => {
  const progressBar = event.currentTarget as HTMLElement
  const rect = progressBar.getBoundingClientRect()
  const clickPosition = event.clientX - rect.left
  const percentage = (clickPosition / rect.width) * 100

  const device_id = localStorage.getItem('device_id')
  if (!device_id) return

  try {
    const [minutes, seconds] = duration.value.split(':').map(Number)
    const durationMs = (minutes * 60 + seconds) * 1000
    const position = Math.floor((percentage / 100) * durationMs)

    await spotifyApi.player.seekToPosition(position, device_id)
  } catch (error) {
    console.error('Failed to seek:', error)
  }
}

onMounted(async () => {
  window.onSpotifyWebPlaybackSDKReady = () => {
    // 从localStorage获取token
    const tokenData = JSON.parse(
      localStorage.getItem('spotify-sdk:AuthorizationCodeWithPKCEStrategy:token') || '{}',
    )
    const access_token = tokenData?.access_token

    const player = new window.Spotify.Player({
      name: 'Web Playback SDK Quick Start Player',
      getOAuthToken: (callback: (token: string) => void) => {
        callback(access_token)
      },
    })

    setupPlayerStateListener(player)

    player.addListener('ready', async ({ device_id }: { device_id: string }) => {
      // Store device_id in localStorage
      localStorage.setItem('device_id', device_id)
      console.log('The Web Playback SDK is ready to play music!')

      // Transfer playback to the current device
      await transferPlayback(device_id)

      player.connect().then((success: boolean) => {
        if (success) {
          console.log('The Web Playback SDK successfully connected to Spotify!')
        }
      })
    })

    player.connect()
  }
})

const togglePlay = async () => {
  const device_id = localStorage.getItem('device_id')
  if (!device_id) return

  try {
    if (isPlaying.value) {
      await spotifyApi.player.pausePlayback(device_id)
    } else {
      await spotifyApi.player.startResumePlayback(device_id)
    }
  } catch (error) {
    console.error('Failed to toggle playback:', error)
  }
}

const skipToPrevious = async () => {
  const device_id = localStorage.getItem('device_id')
  if (!device_id) return

  try {
    await spotifyApi.player.skipToPrevious(device_id)
  } catch (error) {
    console.error('Failed to skip to previous track:', error)
  }
}

const skipToNext = async () => {
  const device_id = localStorage.getItem('device_id')
  if (!device_id) return

  try {
    await spotifyApi.player.skipToNext(device_id)
  } catch (error) {
    console.error('Failed to skip to next track:', error)
  }
}

onUnmounted(() => {
  if (progressInterval) {
    clearInterval(progressInterval)
  }
})
</script>

<template>
  <div class="music-player">
    <div class="track-info">
      <div
        class="track-image"
        :style="currentTrack.imageUrl ? { backgroundImage: `url(${currentTrack.imageUrl})` } : {}"
      ></div>
      <div class="track-details">
        <h4>{{ currentTrack.name || 'Track Name' }}</h4>
        <p>{{ currentTrack.artist || 'Track artist name' }}</p>
      </div>
    </div>

    <div class="player-controls">
      <div class="controls">
        <button class="control-btn" @click="skipToPrevious">
          <i class="fas fa-step-backward"></i>
        </button>
        <button class="control-btn play" @click="togglePlay">
          <i :class="['fas', isPlaying ? 'fa-pause' : 'fa-play']"></i>
        </button>
        <button class="control-btn" @click="skipToNext">
          <i class="fas fa-step-forward"></i>
        </button>
      </div>

      <div class="progress-container">
        <span class="time current">{{ currentTime }}</span>
        <div class="progress-bar" @click="handleProgressClick">
          <div class="progress-bg"></div>
          <div class="progress-current" :style="{ width: `${progress}%` }">
            <div class="progress-handle"></div>
          </div>
        </div>
        <span class="time duration">{{ duration }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.music-player {
  position: fixed;
  bottom: 0;
  left: 300px;
  right: 0;
  background: linear-gradient(180deg, rgba(24, 24, 24, 0.98) 0%, rgba(18, 18, 18, 0.98) 100%);
  backdrop-filter: blur(30px);
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
  height: 80px;
  z-index: 1000;
}

.track-info {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 180px;
  max-width: 30%;
}

.track-image {
  width: 52px;
  height: 52px;
  background-color: #282828;
  background-size: cover;
  background-position: center;
  border-radius: 6px;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.track-image:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.track-details {
  min-width: 0;
  overflow: hidden;
}

.track-details h4 {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.3px;
  margin-bottom: 4px;
}

.track-details p {
  font-size: 0.8rem;
  margin: 0;
  color: #b3b3b3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.2px;
}

.player-controls {
  flex: 1;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin: 0 32px;
}

.controls {
  display: flex;
  align-items: center;
  gap: 24px;
}

.control-btn {
  background: none;
  border: none;
  color: #b3b3b3;
  cursor: pointer;
  padding: 6px;
  font-size: 16px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  color: #fff;
  transform: scale(1.1);
  background-color: rgba(255, 255, 255, 0.1);
}

.control-btn.play {
  background-color: #fff;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  font-size: 16px;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
}

.control-btn.play:hover {
  transform: scale(1.08);
  background-color: #1ed760;
  color: #fff;
  box-shadow: 0 6px 18px rgba(30, 215, 96, 0.4);
}

.progress-container {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
}

.time {
  font-size: 12px;
  color: #b3b3b3;
  min-width: 40px;
  text-align: center;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.progress-bar {
  flex: 1;
  height: 12px;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.progress-bg {
  width: 100%;
  height: 3px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  position: absolute;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-current {
  height: 3px;
  background-color: #1db954;
  border-radius: 3px;
  position: relative;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-handle {
  width: 12px;
  height: 12px;
  background-color: #fff;
  border-radius: 50%;
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%) scale(0);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.progress-bar:hover .progress-bg {
  height: 4px;
}

.progress-bar:hover .progress-current {
  height: 4px;
  background-color: #1ed760;
}

.progress-bar:hover .progress-handle {
  transform: translateY(-50%) scale(1);
}

@media (max-width: 768px) {
  .music-player {
    left: 0;
    padding: 12px 16px;
    height: 70px;
  }

  .track-info {
    max-width: 40%;
  }

  .track-image {
    width: 46px;
    height: 46px;
  }

  .controls {
    gap: 20px;
  }

  .control-btn {
    font-size: 15px;
    width: 28px;
    height: 28px;
  }

  .control-btn.play {
    width: 34px;
    height: 34px;
  }
}

@media (max-width: 480px) {
  .music-player {
    height: auto;
    padding: 12px;
    flex-direction: column;
    gap: 12px;
  }

  .track-info {
    width: 100%;
    max-width: none;
    justify-content: center;
  }

  .track-details {
    text-align: center;
  }

  .progress-container {
    padding: 0 8px;
  }
}
</style>
