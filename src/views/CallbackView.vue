<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { spotifyApi } from '@/config/spotifySDK'

const router = useRouter()

async function handleCallback() {
  try {
    const { authenticated } = await spotifyApi.authenticate()
    if (authenticated) {
      router.push('/')
    }
  } catch (error) {
    console.error(error)
    router.push('/login')
  }
}

onMounted(() => {
  handleCallback()
})
</script>

<template>
  <div class="callback-loading">
    <p>Processing login...</p>
  </div>
</template>

<style scoped>
.callback-loading {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
