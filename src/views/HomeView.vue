<template>
  <div class="home-view container mx-auto px-4 py-8">
    <!-- 标题区域 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold bg-gradient-to-r from-primary-light via-primary to-primary-dark bg-clip-text text-transparent">
        探索精彩视频
      </h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        发现和分享最精彩的视频内容
      </p>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-light border-t-transparent"></div>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-500">{{ error }}</p>
      <button 
        @click="loadVideos"
        class="mt-4 px-4 py-2 bg-primary-light text-white rounded-full hover:bg-primary transition-colors duration-300"
      >
        重试
      </button>
    </div>

    <!-- 视频网格 -->
    <div v-if="!isLoading && videoStore.videos.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <router-link
        v-for="video in videoStore.videos"
        :key="video.id"
        :to="`/video/${video.id}`"
        class="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
      >
        <!-- 缩略图 -->
        <div class="aspect-video relative overflow-hidden">
          <!-- 默认背景 - 当没有封面时显示 -->
          <div v-if="!hasCover(video)" class="absolute inset-0 bg-gradient-to-r from-primary-light to-primary-dark animate-gradient-x opacity-80">
            <div class="absolute inset-0 flex items-center justify-center text-white">
              {{ video.title }}
            </div>
          </div>
          
          <!-- 封面图 -->
          <img
            v-if="getCoverUrl(video)"
            :src="getCoverUrl(video)"
            :alt="video.title"
            class="w-full h-full object-cover"
            @error="handleImageError"
          >

          <!-- 播放按钮 -->
          <div class="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all duration-300">
            <PlayIcon class="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-all duration-300" />
          </div>

          <!-- 添加时长显示 -->
          <div v-if="video.duration" class="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 rounded text-xs text-white">
            {{ formatDuration(video.duration) }}
          </div>
        </div>
        
        <!-- 信息 -->
        <div class="p-4">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white line-clamp-2">
            {{ video.title }}
          </h3>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {{ video.description }}
          </p>

          <!-- 统计信息 -->
          <div class="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
            <span class="flex items-center">
              <EyeIcon class="w-4 h-4 mr-1" />
              {{ formatNumber(video.stats?.views || 0) }}
            </span>
            <span class="flex items-center">
              <HeartIcon class="w-4 h-4 mr-1" />
              {{ formatNumber(video.stats?.likes || 0) }}
            </span>
            <span class="flex items-center">
              <ChatBubbleLeftIcon class="w-4 h-4 mr-1" />
              {{ formatNumber(video.stats?.comments || 0) }}
            </span>
          </div>

          <!-- 元信息 -->
          <div class="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
            <span class="flex items-center">
              <ClockIcon class="w-4 h-4 mr-1" />
              {{ formatDate(video.createdAt) }}
            </span>
            <!-- <span class="flex items-center">
              <DocumentIcon class="w-4 h-4 mr-1" />
              {{ formatFileSize(video.fileSize) }}
            </span> -->
          </div>
        </div>
      </router-link>
    </div>

    <!-- 空状态 -->
    <div v-if="!isLoading && videoStore.videos.length === 0" class="flex flex-col items-center justify-center py-16">
      <div class="w-24 h-24 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <InboxIcon class="w-12 h-12 text-gray-400" />
      </div>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white">暂无视频</h3>
      <p class="mt-1 text-gray-500 dark:text-gray-400">点击右上角的"上传视频"添加新视频</p>
    </div>

    <!-- 加载更多 -->
    <div v-if="hasMore" class="mt-8 text-center">
      <button
        @click="loadMore"
        class="px-6 py-2 bg-white dark:bg-gray-800 text-primary-dark dark:text-primary-light border border-primary-light rounded-full hover:bg-primary-light hover:text-white transition-all duration-300"
        :disabled="isLoadingMore"
      >
        {{ isLoadingMore ? '加载中...' : '加载更多' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useVideoStore } from '../stores/video'
import { ASSETS_BASE_URL } from '../api/config'
import type { VideoItem } from '../types/video'
import {
  PlayIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  InboxIcon,
} from '@heroicons/vue/24/outline'

const videoStore = useVideoStore()
const isLoading = ref(false)
const isLoadingMore = ref(false)
const error = ref('')
const currentPage = ref(1)
const hasMore = ref(true)

const loadVideos = async () => {
  try {
    isLoading.value = true
    error.value = ''
    const response = await videoStore.fetchVideos(1, 12)
    currentPage.value = 1
    hasMore.value = response.data.total > videoStore.videos.length
  } catch (err) {
    error.value = '加载视频失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

const loadMore = async () => {
  if (isLoadingMore.value) return
  try {
    isLoadingMore.value = true
    currentPage.value++
    const response = await videoStore.fetchVideos(currentPage.value, 12)
    hasMore.value = response.data.total > videoStore.videos.length
  } catch (err) {
    currentPage.value--
    error.value = '加载更多失败，请重试'
  } finally {
    isLoadingMore.value = false
  }
}

const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}

// 获取封面URL
const getCoverUrl = (video: VideoItem) => {
  if (video.coverUrl) {
    return `${ASSETS_BASE_URL}${video.coverUrl}`
  }
  if (video.thumbnailUrl) {
    return `${ASSETS_BASE_URL}${video.thumbnailUrl}`
  }
  return null
}

// 判断是否有封面
const hasCover = (video: VideoItem) => {
  return Boolean(video.coverUrl || video.thumbnailUrl)
}

// 添加时长格式化函数
const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

onMounted(() => {
  loadVideos()
})

// 暴露 loadVideos 方法给父组件
defineExpose({
  loadVideos
})
</script>

<style scoped>
.animate-gradient-x {
  background-size: 200% 200%;
  animation: gradient-x 15s ease infinite;
}

@keyframes gradient-x {
  0% { background-position: 0% 50% }
  50% { background-position: 100% 50% }
  100% { background-position: 0% 50% }
}
</style> 