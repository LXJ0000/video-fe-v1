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
      <button @click="play" class="w-20 h-20 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center shadow-xl transition-transform transform hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>
    
    <!-- 右侧操作按钮 -->
    <div class="absolute right-8 bottom-16 flex flex-col items-center space-y-6">
      <!-- 作者头像 - 点击跳转到作者主页 -->
      <div class="flex flex-col items-center">
        <button 
          @click="goToAuthorProfile"
          class="w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-lg transform hover:scale-110 transition-all"
        >
          <img 
            :src="authorAvatar" 
            alt="作者头像" 
            class="w-full h-full object-cover"
          />
        </button>
      </div>
      
      <!-- 收藏按钮 - 点击添加/移除收藏 -->
      <button 
        @click="handleFavorite"
        class="p-3 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all transform hover:scale-110 shadow-lg"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          class="h-6 w-6" 
          :class="isFavorite ? 'text-red-500 fill-current' : 'text-white'"
          viewBox="0 0 24 24" 
          :fill="isFavorite ? 'currentColor' : 'none'"
          stroke="currentColor"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
          />
        </svg>
        <span class="block text-sm font-medium text-white mt-1">{{ likesCount }}</span>
      </button>
      
      <!-- 评论按钮 -->
      <button 
        class="p-3 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all transform hover:scale-110 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span class="block text-sm font-medium text-white mt-1">{{ formatNumber(video.stats?.comments || 0) }}</span>
      </button>
      
      <!-- 分享按钮 - 点击复制视频链接 -->
      <button 
        @click="shareVideo"
        class="p-3 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all transform hover:scale-110 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span class="block text-sm font-medium text-white mt-1">分享</span>
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
import { videoApi } from '@/api/video'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile'
import { message } from '@/utils/message'
import { userApi } from '@/api/user'

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

// 路由和Store
const router = useRouter()
const profileStore = useProfileStore()

// 视频播放器引用
const videoRef = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)
const isLoading = ref(true)
const progress = ref(0)
const isFavorite = ref(false)
const videoDetail = ref<any>(null)
const userInfo = ref<any>(null)
const isLoadingUser = ref(false)

// 计算属性
const videoUrl = computed(() => {
  // 使用API中的getVideoStreamUrl方法获取正确的视频流地址
  return videoApi.getVideoStreamUrl(props.video.id)
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

// 获取作者头像和ID
const authorId = computed(() => videoDetail.value?.userId || '')

const authorAvatar = computed(() => {
  // 优先使用从用户接口获取的头像
  if (userInfo.value?.avatar) {
    if (userInfo.value.avatar && !userInfo.value.avatar.startsWith("http")) {
      userInfo.value.avatar = ASSETS_BASE_URL + userInfo.value.avatar;
      }
    return userInfo.value.avatar
  }
  // 其次使用视频详情中可能包含的用户头像
  if (videoDetail.value?.user?.avatar) {
    return videoDetail.value.user.avatar
  }
  // 如果都没有，则使用随机头像
  return getRandomAvatar()
})

// 点赞/收藏数量，根据收藏状态动态更新
const likesCount = computed(() => {
  // 基础数量
  const baseCount = props.video.stats?.likes || 0
  
  // // 如果原本没收藏，现在收藏了，数量+1
  // if (isFavorite.value && !videoDetail.value?.isFavorite) {
  //   return formatNumber(baseCount + 1)
  // }
  
  // // 如果原本收藏了，现在取消了，数量-1
  // if (!isFavorite.value && videoDetail.value?.isFavorite) {
  //   return formatNumber(Math.max(0, baseCount - 1))
  // }
  
  // 默认返回原数量
  return formatNumber(baseCount)
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

// 随机作者头像
const getRandomAvatar = () => {
  const gender = Math.random() > 0.5 ? 'men' : 'women'
  const id = Math.floor(Math.random() * 80) + 1
  return `https://randomuser.me/api/portraits/${gender}/${id}.jpg`
}

// 获取视频详情
const fetchVideoDetail = async () => {
  try {
    const response = await videoApi.getVideoDetail(props.video.id)
    if (response.data && response.data.code === 0 && response.data.data) {
      videoDetail.value = response.data.data.video
      isFavorite.value = response.data.data.isFavorite || false
      console.log('视频详情:', videoDetail.value)
      
      // 获取到用户ID后，加载用户信息
      if (response.data.data.video?.userId) {
        fetchUserInfo(response.data.data.video.userId)
      }
    }
  } catch (error) {
    console.error('Failed to fetch video detail:', error)
  }
}

// 获取用户信息
const fetchUserInfo = async (userId: string) => {
  if (!userId || isLoadingUser.value) return
  
  try {
    isLoadingUser.value = true
    const response = await userApi.getUserProfile(userId)
    
    if (response.data && response.data.code === 0) {
      userInfo.value = response.data.data
      console.log('用户信息:', userInfo.value)
    }
  } catch (error) {
    console.error('Failed to fetch user info:', error)
  } finally {
    isLoadingUser.value = false
  }
}

// 作者头像点击处理 - 跳转到作者主页
const goToAuthorProfile = (e: Event) => {
  e.stopPropagation() // 阻止冒泡
  if (authorId.value) {
    router.push(`/profile/${authorId.value}`)
  }
}

// 收藏处理
const handleFavorite = async (e: Event) => {
  e.stopPropagation() // 阻止冒泡
  try {
    if (isFavorite.value) {
      props.video.stats.likes --
      // 取消收藏
      const success = await profileStore.removeFromFavorite(props.video.id)
      if (success) {
        isFavorite.value = false
      }
    } else {
      // 添加收藏
      const success = await profileStore.addToFavorite(props.video.id)
      props.video.stats.likes ++
      if (success) {
        isFavorite.value = true
      }
    }
  } catch (error) {
    console.error('Failed to toggle favorite:', error)
  }
}

// 分享视频
const shareVideo = async (e: Event) => {
  e.stopPropagation() // 阻止冒泡
  try {
    const url = `${window.location.origin}/video/${props.video.id}`
    await navigator.clipboard.writeText(url)
    message.success('视频链接已复制到剪贴板')
  } catch (error) {
    console.error('Failed to copy link:', error)
    message.error('复制链接失败')
  }
}

// 监听active状态变化
watch(() => props.active, (newValue) => {
  if (newValue) {
    play()
    // 当视频激活时获取详情
    fetchVideoDetail()
  } else {
    pause()
  }
})

// 组件卸载时暂停视频
onUnmounted(() => {
  if (videoRef.value) {
    videoRef.value.pause()
  }
  
  // 移除空格键事件监听
  window.removeEventListener('keydown', handleKeydown)
})

// 空格键控制播放/暂停
const handleKeydown = (e: KeyboardEvent) => {
  if (e.code === 'Space' && props.active) {
    e.preventDefault() // 防止页面滚动
    togglePlay()
  }
}

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
  
  // 添加空格键事件监听
  window.addEventListener('keydown', handleKeydown)
  
  // 如果组件激活，立即获取视频详情
  if (props.active) {
    fetchVideoDetail()
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