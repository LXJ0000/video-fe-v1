<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <!-- 返回按钮 -->
      <router-link 
        to="/" 
        class="inline-flex items-center mb-6 text-gray-600 dark:text-gray-400 hover:text-primary-dark dark:hover:text-primary-light transition-colors duration-300"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        返回首页
      </router-link>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="aspect-video bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden mb-6 flex items-center justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-light border-t-transparent"></div>
      </div>

      <!-- 错误提示 -->
      <div v-else-if="error" class="aspect-video bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden mb-6 flex items-center justify-center">
        <div class="text-center">
          <p class="text-red-500 mb-4">{{ error }}</p>
          <button 
            @click="loadVideo"
            class="px-4 py-2 bg-primary-light text-white rounded-full hover:bg-primary transition-colors duration-300"
          >
            重试
          </button>
        </div>
      </div>

      <!-- 视频播放器 -->
      <div v-else class="aspect-video bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden mb-6 shadow-lg relative">
        <!-- 使用原生 video 标签先测试 -->
        <video
          ref="videoPlayer"
          class="w-full h-full object-contain"
          :src="videoStreamUrl"
          controls
          autoplay
          preload="auto"
          @error="handleVideoError"
          @loadeddata="handleVideoLoaded"
        >
          您的浏览器不支持 HTML5 视频播放。
          <a :href="videoStreamUrl">下载视频</a>
        </video>
      </div>

      <!-- 视频信息 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {{ video?.title }}
        </h1>
        
        <!-- 元信息 -->
        <div class="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ formatDate(video?.createdAt) }}
          </span>
          <span class="mx-2">•</span>
          <span class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {{ formatFileSize(video?.fileSize || 0) }}
          </span>
        </div>

        <!-- 视频描述 -->
        <p class="text-gray-600 dark:text-gray-300 whitespace-pre-line">
          {{ video?.description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'
import { videoApi } from '../api/video'
import type { VideoItem } from '../types/video'

const route = useRoute()
const videoPlayer = ref<HTMLVideoElement | null>(null)
const player = ref<Plyr | null>(null)
const video = ref<VideoItem | null>(null)
const isLoading = ref(true)
const error = ref('')
const videoStreamUrl = ref('')

const handleVideoLoaded = () => {
  if (videoPlayer.value && video.value) {
    // 更新视频时长
    video.value.duration = Math.floor(videoPlayer.value.duration)
    
    // 初始化播放器
    player.value = new Plyr(videoPlayer.value, {
      controls: [
        'play-large',
        'play',
        'progress',
        'current-time',
        'mute',
        'volume',
        'settings',
        'pip',
        'fullscreen',
      ],
      settings: ['quality', 'speed'],
      speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
      ratio: '16:9',
      fullscreen: { enabled: true, fallback: true, iosNative: true },
    })
  }
}

const handleVideoError = (e: Event) => {
  const video = e.target as HTMLVideoElement
  console.error('Video error:', video.error)
  error.value = `视频加载失败: ${video.error?.message || '未知错误'}`
}

const loadVideo = async () => {
  try {
    isLoading.value = true
    error.value = ''
    const response = await videoApi.getVideoDetail(route.params.id as string)
    video.value = response.data.data
    videoStreamUrl.value = videoApi.getVideoStreamUrl(route.params.id as string)
    console.log('Video data:', video.value)
    console.log('Stream URL:', videoStreamUrl.value)
  } catch (err) {
    console.error('Load video error details:', err)
    error.value = '加载视频失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

onMounted(() => {
  loadVideo()
})

onUnmounted(() => {
  if (videoPlayer.value) {
    videoPlayer.value.removeEventListener('error', handleVideoError)
  }
  if (player.value) {
    player.value.destroy()
  }
})
</script>

<style>
.plyr {
  @apply rounded-xl w-full h-full;
  --plyr-color-main: theme('colors.primary.DEFAULT');
  --plyr-video-background: theme('colors.gray.800');
}

.dark .plyr {
  --plyr-video-background: theme('colors.gray.900');
}

/* 确保视频容器保持纵横比 */
.aspect-video {
  aspect-ratio: 16 / 9;
  width: 100%;
  height: auto;
}

/* 视频元素样式 */
video {
  @apply w-full h-full object-contain;
}
</style> 