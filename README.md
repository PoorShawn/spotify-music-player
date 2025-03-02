# Spotify Music Player

一个基于 Vue 3 开发的 Spotify 音乐播放器网页应用，提供流畅的音乐播放体验和个性化推荐功能。

## 功能截图

![功能演示](public/images/屏幕截图%202025-03-02%20110120.png)

![功能演示](public/images/屏幕截图%202025-03-02%20110148.png)

![功能演示](public/images/屏幕截图%202025-03-02%20110320.png)

## 功能特性

- 🎵 Spotify 账号登录与授权
- 🎼 音乐播放控制（播放、暂停、上一首、下一首）
- 📑 最近播放记录展示
- 👥 个性化艺人推荐
- 🎯 基于用户喜好的音乐推荐
- 🔍 音乐搜索功能
- 📱 响应式设计，支持移动端访问

## 技术栈

- **前端框架**: Vue 3
- **开发语言**: TypeScript
- **构建工具**: Vite
- **路由管理**: Vue Router
- **状态管理**: Pinia
- **API 集成**: Spotify Web API
- **样式处理**: CSS with Scoped styling
- **代码规范**: ESLint + Prettier
- **测试工具**: Vitest

## 快速开始

### 前置要求

- Node.js (推荐 v16 或更高版本)
- Spotify 开发者账号（通过 Web Playback SDK 播放音乐需使用 Spotify Premium 账号）
- Spotify API Client ID 和 Client Secret

### 安装步骤

1. 克隆项目到本地：

```bash
git clone https://github.com/yourusername/spotify-music-player.git
cd spotify-music-player
```

2. 安装依赖：

```bash
npm install
```

3. 配置环境变量：

创建 .env 文件并添加以下配置：

```
VITE_SPOTIFY_CLIENT_ID=your_client_id
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
```

4. 启动开发服务器：

```bash
npm run dev
```

## 致谢
- [codewithsadee](https://www.youtube.com/watch?v=Ms5Uhj87XsE) - 感谢其制作的优秀的 Spotify Clone 教程，该教程详细展示了如何构建一个全栈音乐播放器应用。
- [Muffon](https://github.com/staniel359/muffon) - 一个优秀的跨平台音乐流媒体客户端项目，为本项目提供了很多的激励和鼓舞。
- [Spotify API](https://developer.spotify.com/)
- [Vue.js](https://cn.vuejs.org/), [TypeScript](https://www.tslang.cn/), [Vite](https://vitejs.cn/vite3-cn/guide/)
