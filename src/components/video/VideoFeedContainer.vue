<template>
  <div 
    ref="containerRef" 
    class="video-feed-container h-full w-full bg-black overflow-hidden touch-none"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @keydown="handleKeyDown"
    tabindex="0"
  >
    <!-- 视频项列表 -->
    <div 
      class="videos-wrapper h-full w-full relative"
      :style="{ transform: `translateY(${-currentIndex * 100}%)` }"
    >
      <div
        v-for="(video, index) in videos"
        :key="video.id"
        class="video-item absolute inset-0 w-full h-full"
        :style="{ transform: `translateY(${index * 100}%)` }"
      >
        <VideoFeedItem
          :video="video"
          :active="index === currentIndex"
          :loop="loop"
          :muted="muted"
          :autoplay="autoplay"
          :show-controls="false"
          @play="handleVideoPlay(index)"
          @ended="handleVideoEnded(index)"
        />
      </div>
    </div>
    
    <!-- 进度指示器 -->
    <div class="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col space-y-1">
      <div 
        v-for="(_, index) in videos" 
        :key="index"
        class="w-1 h-4 rounded-full transition-all duration-300"
        :class="index === currentIndex ? 'bg-white' : 'bg-white/30'"
      ></div>
    </div>
    
    <!-- 播放速度控制 -->
    <div class="absolute left-3 bottom-24 z-10">
      <div class="bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs flex items-center">
        <span>速度:</span>
        <select 
          v-model="playbackSpeed" 
          class="ml-1 bg-transparent text-white outline-none"
          @change="handleSpeedChange"
        >
          <option value="0.5">0.5x</option>
          <option value="1">1.0x</option>
          <option value="1.5">1.5x</option>
          <option value="2">2.0x</option>
        </select>
      </div>
    </div>
    
    <!-- 加载更多指示器 -->
    <div 
      v-if="isLoadingMore"
      class="absolute left-0 right-0 bottom-0 flex justify-center items-center py-4 pointer-events-none"
    >
      <div class="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useSwipe } from '@vueuse/core'
import VideoFeedItem from './VideoFeedItem.vue'
import type { VideoItem } from '@/types/video'

const props = defineProps<{
  videos: VideoItem[]
  loop?: boolean
  muted?: boolean
  autoplay?: boolean
  transitionDuration?: number
}>()

const emit = defineEmits<{
  (e: 'change', index: number): void
  (e: 'load-more'): void
}>()

// 状态
const containerRef = ref<HTMLElement | null>(null)
const currentIndex = ref(0)
const touchStartY = ref(0)
const touchDeltaY = ref(0)
const isLoadingMore = ref(false)
const playbackSpeed = ref('1')

// 计算属性
const canGoPrev = computed(() => currentIndex.value > 0)
const canGoNext = computed(() => currentIndex.value < props.videos.length - 1)

// 手势处理
const startY = ref(0)
const endY = ref(0)
const SWIPE_THRESHOLD = 100 // 滑动阈值

const handleTouchStart = (e: TouchEvent) => {
  startY.value = e.touches[0].clientY
}

const handleTouchMove = (e: TouchEvent) => {
  if (startY.value === 0) return
  endY.value = e.touches[0].clientY
}

const handleTouchEnd = () => {
  if (startY.value === 0 || endY.value === 0) return
  
  const deltaY = startY.value - endY.value
  
  if (Math.abs(deltaY) > SWIPE_THRESHOLD) {
    if (deltaY > 0 && canGoNext.value) {
      goToNext()
    } else if (deltaY < 0 && canGoPrev.value) {
      goToPrev()
    }
  }
  
  // 重置
  startY.value = 0
  endY.value = 0
}

// 键盘事件处理
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowUp' && canGoPrev.value) {
    goToPrev()
  } else if (e.key === 'ArrowDown' && canGoNext.value) {
    goToNext()
  }
}

// 视频事件处理
const handleVideoPlay = (index: number) => {
  // 如果播放的不是当前视频，则暂停其他视频
  if (index !== currentIndex.value) {
    currentIndex.value = index
  }
}

const handleVideoEnded = (index: number) => {
  // 如果配置了循环播放，可以在这里处理
  if (!props.loop && canGoNext.value) {
    goToNext()
  }
}

// 播放速度变化处理
const handleSpeedChange = () => {
  const videoElements = document.querySelectorAll('video')
  const speed = parseFloat(playbackSpeed.value)
  
  videoElements.forEach(video => {
    video.playbackRate = speed
  })
}

// 导航方法
const goToPrev = () => {
  if (canGoPrev.value) {
    currentIndex.value--
    emit('change', currentIndex.value)
  }
}

const goToNext = () => {
  if (canGoNext.value) {
    currentIndex.value++
    emit('change', currentIndex.value)
    
    // 如果已经滚动到倒数第二个视频，加载更多
    if (currentIndex.value >= props.videos.length - 2) {
      isLoadingMore.value = true
      emit('load-more')
    }
  }
}

// 监听视频列表变化
watch(() => props.videos.length, (newLength, oldLength) => {
  isLoadingMore.value = false
  
  // 如果是首次加载视频，设置 currentIndex 为 0
  if (oldLength === 0 && newLength > 0) {
    currentIndex.value = 0
  }
})

// 初始化
onMounted(() => {
  if (containerRef.value) {
    containerRef.value.focus()
  }
})
</script>

<style scoped>
.video-feed-container {
  position: relative;
}

.videos-wrapper {
  transition: transform 0.3s ease;
}

.video-item {
  will-change: transform;
}
</style> 