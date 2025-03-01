import { createRouter, createWebHistory } from 'vue-router'
import { spotifyApi } from '@/config/spotifySDK'
import HomeView from '../views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import CallbackView from '@/views/CallbackView.vue'
import ArtistView from '@/views/ArtistView.vue'
import ExploreView from '@/views/ExploreView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/auth/callback',
      name: 'callback',
      component: CallbackView,
    },
    {
      path: '/artist/:id',
      name: 'artist',
      component: ArtistView,
    },
    {
      path: '/explore',
      name: 'explore',
      component: ExploreView,
    },
    {
      path: '/category/:id',
      name: 'category',
      component: () => import('@/views/CategoryView.vue'),
    },
    {
      path: '/albums',
      name: 'albums',
      component: () => import('../views/AlbumsView.vue'),
    },
    {
      path: '/album/:id',
      name: 'album',
      component: () => import('@/views/AlbumDetailView.vue'),
    },
    {
      path: '/playlists',
      name: 'playlists',
      component: () => import('@/views/PlaylistsView.vue'),
    },
    {
      path: '/playlist/:id',
      name: 'playlist',
      component: () => import('@/views/PlaylistDetailView.vue'),
    }
  ],
})

// 全局前置守卫
router.beforeEach(async (to) => {
  if (to.path === '/login') {
    // 检查 localStorage 中是否存在 token
    const tokenData = localStorage.getItem('spotify-sdk:AuthorizationCodeWithPKCEStrategy:token')
    if (tokenData) {
      return { path: '/' }
    }
  } else if (to.path !== '/auth/callback') {
    try {
      const { authenticated } = await spotifyApi.authenticate()
      if (!authenticated) {
        return { path: '/login' }
      }
    } catch (error) {
      console.error('Authentication check failed:', error)
      return { path: '/login' }
    }
  }
})

export default router
