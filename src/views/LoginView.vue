<script setup lang="ts">
import { spotifyApi } from '@/config/spotifySDK'

async function handleAuth() {
  try {
    await spotifyApi.authenticate()
  } catch (error) {
    console.error('Authentication failed:', error)
  }
}
</script>

<template>
  <main>
    <div class="banner">
      <img src="/images/login-banner.jpg" alt="Login Banner" class="img-cover" />
    </div>

    <div class="content">
      <a href="/images/logo.svg" class="logo">
        <img src="/images/logo.svg" alt="Logo" />
      </a>

      <div class="wrapper">
        <h2 class="title headline-medium">
          <strong>Join us</strong> and embark on an incredible <strong>musical journey</strong>!
        </h2>

        <a @click.prevent="handleAuth" class="btn btn-primary has-icon">
          <img src="/images/spotify-on-primary.svg" alt="Login Button" />

          <span class="label-large">Continue with Spotify</span>

          <!-- Adjust opacity of button when hovered-->
          <div class="state-layer"></div>
        </a>
      </div>
    </div>
  </main>

  <footer>
    <p class="bottom-text label-large">
      Powered by <a href="https://spotify.com" target="_blank" class="link link-primary">Spotify</a>
    </p>
  </footer>
</template>

<style scoped>
/* 主容器网格布局 */
main {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 将页面分为两等份 */
  min-height: 100vh;
}

/* 左侧横幅区域 */
.banner {
  position: relative;
  display: none; /* 移动端默认隐藏 */
}

/* 横幅图片样式 */
.img-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  inset: 0;
}

/* 右侧内容区域 - Flex布局 */
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 2rem;
}

/* Logo容器 */
.logo {
  width: 180px;
  height: auto;
}

.logo img {
  width: 100%;
  height: 100%;
}

/* 内容包装器 */
.wrapper {
  max-width: 400px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* 标题样式 */
.title {
  color: var(--md-sys-color-on-surface);
  font-size: 1.5rem;
  line-height: 1.4;
}

/* 登录按钮样式 */
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  border-radius: 2rem; /* 圆角按钮 */
  text-decoration: none;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 添加阴影 */
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.btn-primary {
  background-color: #1db954;
  color: white;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

/* 按钮内的图标大小 */
.btn img {
  width: 24px;
  height: 24px;
}

/* 按钮��停效果层 */
.state-layer {
  position: absolute;
  inset: 0;
  background-color: white;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.btn:hover .state-layer {
  opacity: 0.1;
}

/* 页脚固定定位 */
footer {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem;
  text-align: right;
  background-color: transparent;
}

.bottom-text {
  color: var(--md-sys-color-on-surface-variant);
}

/* 链接样式 */
.link {
  text-decoration: none;
  color: inherit;
}

.link-primary {
  color: var(--md-sys-color-primary);
}

/* 响应式布局 */
@media (min-width: 768px) {
  .banner {
    display: block; /* 在桌面端显示横幅 */
  }
}

/* 移动端适配 */
@media (max-width: 767px) {
  main {
    grid-template-columns: 1fr; /* 单列布局 */
  }
}
</style>
