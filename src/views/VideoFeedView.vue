<template>
  <div class="video-feed-view h-screen w-full bg-black flex flex-col pt-16 dark">
    <!-- 顶部导航栏 -->
    <div class="fixed top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
      <div class="flex items-center justify-between">
        <router-link 
          to="/" 
          class="flex items-center text-white hover:text-primary-light transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>返回首页</span>
        </router-link>
      </div>
    </div>
    
    <!-- 视频容器 -->
    <div ref="feedContainer" class="flex-1 relative">
      <!-- 加载中状态 -->
      <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-light border-t-transparent"></div>
      </div>
      
      <!-- 加载失败状态 -->
      <div v-else-if="error" class="absolute inset-0 flex items-center justify-center text-white">
        <div class="text-center">
          <p class="text-red-500 mb-4">{{ error }}</p>
          <button 
            @click="loadVideos"
            class="px-4 py-2 bg-primary-light text-white rounded-full hover:bg-primary transition-colors duration-300"
          >
            重试
          </button>
        </div>
      </div>
      
      <!-- 视频列表 -->
      <div v-else class="h-full">
        <div v-if="videos.length === 0" class="h-full flex items-center justify-center text-white">
          <div class="text-center">
            <div class="w-24 h-24 mb-4 rounded-full bg-gray-800 flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-white">暂无视频</h3>
            <p class="mt-1 text-gray-400">敬请期待更多精彩内容</p>
          </div>
        </div>
        
        <VideoFeedContainer
          v-else
          :videos="videos"
          :loop="true"
          :muted="false"
          :autoplay="true"
          @change="handleVideoChange"
          @load-more="handleLoadMore"
        />
      </div>
    </div>
    
    <!-- 首次使用的引导提示 (可选) -->
    <div v-if="showGuide" class="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" @click="showGuide = false">
      <div class="text-center text-white">
        <div class="mb-6 flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          <p>上下滑动切换视频</p>
        </div>
        
        <div class="mb-6 flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>点击视频中心区域播放/暂停</p>
        </div>
        
        <button class="px-6 py-3 bg-primary-light text-white rounded-full">
          开始探索
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeMount, onUnmounted } from 'vue'
import { useVideoStore } from '../stores/video'
import { useThemeStore } from '../stores/theme'
import VideoFeedContainer from '../components/video/VideoFeedContainer.vue'
import type { VideoItem } from '../types/video'

// 状态变量
const videoStore = useVideoStore()
const themeStore = useThemeStore()
const isLoading = ref(true)
const error = ref('')
const videos = ref<VideoItem[]>([])
const currentPage = ref(1)
const feedContainer = ref<HTMLElement | null>(null)
const showGuide = ref(false) // 可以根据用户是否首次使用来决定是否显示引导
const previousTheme = ref<'dark' | 'light'>(localStorage.getItem('theme') as 'dark' | 'light' || 'light')

// 加载视频
const loadVideos = async () => {
  try {
    isLoading.value = true
    error.value = ''
    
    // 使用现有的公开视频API
    await videoStore.fetchPublicVideos(1, 10)
    
    // 更新本地视频列表
    videos.value = [...videoStore.publicVideos]
    
    isLoading.value = false
    
    // 根据用户配置选择是否显示引导
    const hasSeenGuide = localStorage.getItem('hasSeenVideoFeedGuide')
    if (!hasSeenGuide) {
      showGuide.value = true
      localStorage.setItem('hasSeenVideoFeedGuide', 'true')
    }
  } catch (err) {
    isLoading.value = false
    error.value = '加载视频失败，请稍后重试'
    console.error('Failed to load videos:', err)
  }
}

// 加载更多视频
const handleLoadMore = async () => {
  try {
    currentPage.value++
    const result = await videoStore.fetchPublicVideos(currentPage.value, 5)
    
    // 添加新的视频到列表中
    if (videoStore.publicVideos.length > videos.value.length) {
      videos.value = [...videoStore.publicVideos]
    }
  } catch (err) {
    console.error('Failed to load more videos:', err)
  } finally {
    // 确保加载指示器被清除，无论成功还是失败
    const videoFeedContainer = document.querySelector('.video-feed-container');
    if (videoFeedContainer) {
      const loadingIndicator = videoFeedContainer.querySelector('.animate-spin');
      if (loadingIndicator) {
        loadingIndicator.parentElement.style.display = 'none';
      }
    }
  }
}

// 视频切换处理
const handleVideoChange = (index: number) => {
  console.log(`视频切换到索引: ${index}`)
  // 这里可以添加分析或埋点逻辑
}

// 进入页面时强制黑暗模式
onBeforeMount(() => {
  // 保存当前主题
  previousTheme.value = themeStore.isDark ? 'dark' : 'light'
  // 强制设置为黑暗模式
  themeStore.setTheme('dark')
})

// 初始化
onMounted(() => {
  // 初始化视频加载
  loadVideos()
  
  // 处理滚动锁定
  document.body.style.overflow = 'hidden'
  
  return () => {
    // 清理
    document.body.style.overflow = ''
  }
})

// 在组件卸载时，恢复之前的主题
onUnmounted(() => {
  // 恢复之前的主题设置
  themeStore.setTheme(previousTheme.value)
})
</script>

<style scoped>
.video-feed-view {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10; /* 降低z-index以确保导航栏在上面 */
}
</style> 