<template>
  <div class="video-feed-item relative h-full w-full overflow-hidden bg-black">
    <!-- 视频播放器 -->
    <video
      ref="videoRef"
      class="w-full h-full object-contain"
      :src="videoUrl"
      :poster="posterUrl"
      :loop="loop"
      :muted="muted"
      :autoplay="autoplay"
      :controls="showControls"
      playsinline
      webkit-playsinline
      @play="$emit('play')"
      @pause="$emit('pause')"
      @ended="$emit('ended')"
      @timeupdate="handleTimeUpdate"
      @click="togglePlay"
    >
      您的浏览器不支持 HTML5 视频播放
    </video>
    
    <!-- 加载状态 -->
    <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-light border-t-transparent"></div>
    </div>
    
    <!-- 视频控制层 -->
    <div class="absolute inset-0 flex items-center justify-center" v-if="!isPlaying && !isLoading">
      <button @click="play" class="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>
    
    <!-- 右侧操作按钮 -->
    <div class="absolute right-3 bottom-24 flex flex-col items-center space-y-4">
      <!-- 点赞 -->
      <button class="p-2 rounded-full bg-black/30 backdrop-blur-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <span class="block text-xs text-white mt-1">{{ formatNumber(video.stats?.likes || 0) }}</span>
      </button>
      
      <!-- 评论 -->
      <button class="p-2 rounded-full bg-black/30 backdrop-blur-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span class="block text-xs text-white mt-1">{{ formatNumber(video.stats?.comments || 0) }}</span>
      </button>
      
      <!-- 分享 -->
      <button class="p-2 rounded-full bg-black/30 backdrop-blur-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span class="block text-xs text-white mt-1">分享</span>
      </button>
    </div>
    
    <!-- 底部信息栏 -->
    <div class="absolute left-0 right-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
      <h3 class="text-white text-lg font-medium">{{ video.title }}</h3>
      <p class="text-white/80 text-sm line-clamp-2 mt-1">{{ video.description }}</p>
    </div>
    
    <!-- 播放进度条 -->
    <div class="absolute bottom-0 left-0 right-0 h-1 bg-gray-700/50">
      <div class="h-full bg-primary-light" :style="{ width: `${progress}%` }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ASSETS_BASE_URL } from '@/api/config'
import type { VideoItem } from '@/types/video'

const props = defineProps<{
  video: VideoItem
  active: boolean
  loop?: boolean
  muted?: boolean
  autoplay?: boolean
  showControls?: boolean
}>()

const emit = defineEmits<{
  (e: 'play'): void
  (e: 'pause'): void
  (e: 'ended'): void
  (e: 'timeupdate', time: number): void
}>()

// 视频播放器引用
const videoRef = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)
const isLoading = ref(true)
const progress = ref(0)

// 计算属性
const videoUrl = computed(() => {
  // 使用API中获取视频流地址的逻辑
  const token = localStorage.getItem('token') || ''
  const url = new URL(`${ASSETS_BASE_URL}/api/videos/${props.video.id}/stream`)
  url.searchParams.set('t', Date.now().toString())
  if (token) {
    url.searchParams.set('token', token)
  }
  return url.toString()
})

const posterUrl = computed(() => {
  if (props.video.coverUrl) {
    return `${ASSETS_BASE_URL}${props.video.coverUrl}`
  }
  if (props.video.thumbnailUrl) {
    return `${ASSETS_BASE_URL}${props.video.thumbnailUrl}`
  }
  return ''
})

// 方法
const play = () => {
  if (videoRef.value) {
    videoRef.value.play()
    isPlaying.value = true
  }
}

const pause = () => {
  if (videoRef.value) {
    videoRef.value.pause()
    isPlaying.value = false
  }
}

const togglePlay = () => {
  if (isPlaying.value) {
    pause()
  } else {
    play()
  }
}

const handleTimeUpdate = (event: Event) => {
  const video = event.target as HTMLVideoElement
  if (video) {
    progress.value = (video.currentTime / video.duration) * 100
    emit('timeupdate', video.currentTime)
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

// 监听active状态变化
watch(() => props.active, (newValue) => {
  if (newValue) {
    play()
  } else {
    pause()
  }
})

// 监听视频加载
onMounted(() => {
  if (videoRef.value) {
    videoRef.value.addEventListener('loadeddata', () => {
      isLoading.value = false
      if (props.active && props.autoplay) {
        play()
      }
    })
    
    videoRef.value.addEventListener('playing', () => {
      isPlaying.value = true
    })
    
    videoRef.value.addEventListener('pause', () => {
      isPlaying.value = false
    })
    
    videoRef.value.addEventListener('ended', () => {
      isPlaying.value = false
    })
  }
})

// 组件卸载时暂停视频
onUnmounted(() => {
  if (videoRef.value) {
    videoRef.value.pause()
  }
})
</script>

<style scoped>
.video-feed-item {
  position: relative;
  height: 100%;
  width: 100%;
}
</style> 