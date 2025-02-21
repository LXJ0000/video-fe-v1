<template>
  <div class="container mx-auto px-4 py-8 relative">
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
          crossorigin="anonymous"
          controls
          autoplay
          preload="auto"
          @error="handleVideoError"
          @loadeddata="handleVideoLoaded"
          @play="handlePlay"
        >
          您的浏览器不支持 HTML5 视频播放。
          <a :href="videoStreamUrl">下载视频</a>
        </video>
      </div>

      <!-- 播放控制区域 -->
      <div class="flex items-center gap-3 mb-2">
        <!-- 智能调速开关 -->
        <div class="relative flex items-center">
          <label class="flex items-center gap-2">
            <input
              type="checkbox"
              v-model="playbackStore.isAutoSpeedEnabled"
              class="form-checkbox h-4 w-4 rounded border-gray-300 text-primary-light focus:ring-primary-light/20"
            >
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">智能调速</span>
          </label>
          
          <!-- 提示图标移到右下角 -->
          <div class="relative" style="margin: 0 0 -4px 2px">
            <button
              type="button"
              class="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors inline-flex items-center"
              @mouseenter="showTooltip = true"
              @mouseleave="showTooltip = false"
            >
              <QuestionMarkCircleIcon class="h-3.5 w-3.5" />
            </button>
            
            <!-- 工具提示 -->
            <div
              v-if="showTooltip"
              class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-gray-900/90 backdrop-blur-sm text-white rounded-lg shadow-lg z-50 text-xs"
            >
              <div class="text-gray-200">
                <p>通过分析音频特征，自动调整播放速度以匹配您设定的目标语速</p>
              </div>
              <!-- 小三角形 -->
              <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900/90 rotate-45"></div>
            </div>
          </div>
        </div>
        
        <!-- WPM 设置和显示 -->
        <div v-if="playbackStore.isAutoSpeedEnabled" class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">目标语速</span>
            <input
              type="number"
              v-model="playbackStore.userPreferences.targetWPM"
              class="w-16 px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded-md focus:ring-1 focus:ring-primary-light/30 focus:border-primary-light dark:bg-gray-800 dark:text-gray-300"
              min="80"
              max="300"
              step="10"
              @change="playbackStore.savePreferences()"
            >
            <span class="text-xs text-gray-400 dark:text-gray-500">WPM</span>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <span class="text-gray-500 dark:text-gray-400">当前</span>
            <span class="font-mono bg-gray-100 dark:bg-gray-800/50 px-2 py-0.5 rounded">
              {{ Math.round(playbackStore.currentWPM) }} WPM
            </span>
            <span class="text-gray-300 dark:text-gray-600">•</span>
            <span class="font-mono bg-gray-100 dark:bg-gray-800/50 px-2 py-0.5 rounded">
              {{ currentSpeed.toFixed(2) }}x
            </span>
          </div>
        </div>
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

      <!-- 可以添加一个提示，显示继续播放的位置 暂时不要 -->
      <!-- <div v-if="video && historyStore.getVideoProgress(video.id) > 0" 
        class="mb-4 p-4 bg-primary-light/10 rounded-lg text-gray-700 dark:text-gray-300">
        从上次观看的位置继续播放
      </div> -->
    </div>

    <!-- 将对话框移到最外层 -->
    <div class="dialog-container">
      <TransitionRoot appear :show="showSpeedSettings" as="template">
        <Dialog as="div" @close="showSpeedSettings = false" class="relative z-50">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100"
            leave-to="opacity-0"
          >
            <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </TransitionChild>

          <div class="fixed inset-0 overflow-y-auto">
            <div class="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild
                as="template"
                enter="duration-300 ease-out"
                enter-from="opacity-0 scale-95"
                enter-to="opacity-100 scale-100"
                leave="duration-200 ease-in"
                leave-from="opacity-100 scale-100"
                leave-to="opacity-0 scale-95"
              >
                <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <DialogTitle
                    as="h3"
                    class="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4"
                  >
                    智能调速设置
                  </DialogTitle>

                  <!-- 基准语速设置 -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2">基准语速 (WPM)</label>
                    <input
                      type="number"
                      v-model="playbackStore.userPreferences.targetWPM"
                      class="w-full px-3 py-2 border rounded-lg"
                      min="100"
                      max="300"
                      step="10"
                    >
                    <p class="mt-1 text-sm text-gray-500">
                      推荐范围：120-180 WPM
                    </p>
                  </div>

                  <!-- 速度范围设置 -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2">播放速度范围</label>
                    <div class="flex gap-4">
                      <div>
                        <label class="text-sm">最小</label>
                        <input
                          type="number"
                          v-model="playbackStore.userPreferences.speedRange.min"
                          class="w-24 px-3 py-2 border rounded-lg"
                          min="0.25"
                          max="1"
                          step="0.25"
                        >
                      </div>
                      <div>
                        <label class="text-sm">最大</label>
                        <input
                          type="number"
                          v-model="playbackStore.userPreferences.speedRange.max"
                          class="w-24 px-3 py-2 border rounded-lg"
                          min="1"
                          max="3"
                          step="0.25"
                        >
                      </div>
                    </div>
                  </div>

                  <!-- 按钮 -->
                  <div class="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      @click="showSpeedSettings = false"
                      class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      @click="handleSaveSettings"
                      class="px-4 py-2 text-sm font-medium text-white bg-primary-light hover:bg-primary rounded-md"
                    >
                      保存
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </TransitionRoot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'
import { videoApi } from '../api/video'
import type { VideoItem } from '../types/video'
import { useHistoryStore } from '../stores/history'
import { usePlaybackStore } from '../stores/playback'
import { CogIcon, QuestionMarkCircleIcon } from '@heroicons/vue/24/outline'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionRoot,
  TransitionChild,
} from '@headlessui/vue'

const route = useRoute()
const videoPlayer = ref<HTMLVideoElement | null>(null)
const player = ref<Plyr | null>(null)
const video = ref<VideoItem | null>(null)
const isLoading = ref(true)
const error = ref('')
const videoStreamUrl = ref('')

const historyStore = useHistoryStore()
const updateProgressTimer = ref<number>()
const playbackStore = usePlaybackStore()
const audioContext = ref<AudioContext | null>(null)
const analyser = ref<AnalyserNode | null>(null)

// 播放速度选项
const speedOptions = [
  { label: '0.5x', value: 0.5 },
  { label: '1x', value: 1 },
  { label: '1.5x', value: 1.5 },
  { label: '2x', value: 2 }
]

// 当前播放速度
const currentSpeed = ref(1)

// 添加状态标记
const isAudioInitialized = ref(false)
const analyzeTimer = ref<number>()

// 添加播放状态追踪
const isPlaying = ref(false)

// 添加提示状态
const showTooltip = ref(false)

// 检查播放器是否可用
const isPlayerReady = (p: Plyr | null): p is Plyr => {
  return p !== null && typeof p.speed === 'number'
}

const handleVideoLoaded = async () => {
  if (videoPlayer.value && video.value) {
    // 更新视频时长
    video.value.duration = Math.floor(videoPlayer.value.duration)
    
    // 设置上次播放进度
    const lastProgress = historyStore.getVideoProgress(video.value.id)
    if (lastProgress > 0) {
      videoPlayer.value.currentTime = lastProgress
    }
    
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
      speed: { selected: 1, options: speedOptions.map(option => option.value) },
      ratio: '16:9',
      fullscreen: { enabled: true, fallback: true, iosNative: true },
    })

    // 监听播放器事件
    player.value.on('ready', () => {
      // 监听速度变化
      player.value?.on('ratechange', () => {
        if (isPlayerReady(player.value)) {
          currentSpeed.value = player.value.speed
        }
      })

      // 添加播放状态监听
      player.value?.on('play', () => {
        isPlaying.value = true
      })

      player.value?.on('pause', () => {
        isPlaying.value = false
      })
    })

    // 定时记录播放进度
    updateProgressTimer.value = window.setInterval(() => {
      if (video.value && videoPlayer.value) {
        historyStore.updateHistory(video.value, Math.floor(videoPlayer.value.currentTime))
      }
    }, 5000)

    // 不要在这里初始化音频分析
    // 等待用户点击播放按钮
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

// 修改播放速度
const handleSpeedChange = (speed: number) => {
  if (player.value) {
    player.value.speed = speed
    currentSpeed.value = speed
  }
}

// 修改音频初始化
const initAudioAnalysis = async () => {
  if (!videoPlayer.value || isAudioInitialized.value) return
  
  try {
    audioContext.value = new AudioContext()
    await audioContext.value.resume()
    
    const source = audioContext.value.createMediaElementSource(videoPlayer.value)
    analyser.value = audioContext.value.createAnalyser()
    
    analyser.value.fftSize = 2048
    
    source.connect(analyser.value)
    analyser.value.connect(audioContext.value.destination)
    
    isAudioInitialized.value = true
    
    // 开始分析
    startAnalysis()
  } catch (error) {
    console.error('Failed to initialize audio analysis:', error)
  }
}

// 修改音频分析函数
const analyzeAudio = () => {
  if (!analyser.value || !playbackStore.isAutoSpeedEnabled || !isPlaying.value) {
    return
  }
  
  try {
    const dataArray = new Float32Array(analyser.value.frequencyBinCount)
    analyser.value.getFloatTimeDomainData(dataArray)
    
    playbackStore.analyzeSpeech(dataArray)
    
    // 安全地更新播放速度
    if (isPlayerReady(player.value)) {
      try {
        const newSpeed = playbackStore.suggestedSpeed
        player.value.speed = newSpeed
        currentSpeed.value = newSpeed
      } catch (err) {
        console.warn('Failed to update playback speed:', err)
      }
    }
  } catch (error) {
    console.error('Audio analysis error:', error)
  }
}

// 修改播放器初始化
const handlePlay = async () => {
  if (!isAudioInitialized.value) {
    await initAudioAnalysis()
    await new Promise(resolve => setTimeout(resolve, 100))
    if (playbackStore.isAutoSpeedEnabled) {
      startAnalysis()
    }
  }
}

// 修改开始分析函数
const startAnalysis = () => {
  stopAnalysis()
  
  if (isPlayerReady(player.value)) {
    analyzeTimer.value = window.setInterval(analyzeAudio, 200)
  }
}

// 停止分析
const stopAnalysis = () => {
  if (analyzeTimer.value) {
    clearInterval(analyzeTimer.value)
    analyzeTimer.value = undefined
  }
}

const showSpeedSettings = ref(false)

// 添加保存设置的处理函数
const handleSaveSettings = () => {
  playbackStore.savePreferences()
  showSpeedSettings.value = false
}

onMounted(() => {
  historyStore.loadHistory()
  playbackStore.loadPreferences()
  loadVideo()
})

onUnmounted(() => {
  if (videoPlayer.value) {
    videoPlayer.value.removeEventListener('error', handleVideoError)
  }
  if (player.value) {
    player.value.destroy()
  }
  if (updateProgressTimer.value) {
    clearInterval(updateProgressTimer.value)
  }
  stopAnalysis()
  if (audioContext.value) {
    audioContext.value.close()
  }
})

// 监听智能调速开关
watch(() => playbackStore.isAutoSpeedEnabled, (enabled) => {
  if (enabled) {
    if (!isAudioInitialized.value) {
      initAudioAnalysis()
    }
    startAnalysis()
  } else {
    stopAnalysis()
    // 恢复正常播放速度
    if (isPlayerReady(player.value)) {
      player.value.speed = 1
      currentSpeed.value = 1
    }
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

<style scoped>
.dialog-container {
  position: relative;
  z-index: 100;
}
</style> 