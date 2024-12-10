<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'

import BaseLayout from '@/components/layouts/BaseLayout.vue'

const route = useRoute()
const isAuthRoute = computed(() => {
  return ['/login', '/auth/callback'].includes(route.path)
})
</script>

<template>
  <template v-if="isAuthRoute">
    <RouterView />
  </template>

  <BaseLayout v-else>
    <RouterView />
  </BaseLayout>
</template>

<style scoped></style>
