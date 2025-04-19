<template>
  <div 
    :class="$attrs.class" 
    @click="$emit('click', $event)" 
    class="cursor-pointer"
  >
    <div class="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
      <!-- 视频缩略图容器 -->
      <div class="aspect-video relative overflow-hidden">
        <!-- 默认背景 - 当没有封面时显示 -->
        <div v-if="!hasCover" class="absolute inset-0 bg-gradient-to-r from-primary-light to-primary-dark animate-gradient-x opacity-80">
          <div class="absolute inset-0 flex items-center justify-center text-white">
            {{ video.title }}
          </div>
        </div>
        
        <!-- 封面图 -->
        <img
          v-if="coverImageUrl"
          :src="coverImageUrl"
          :alt="video.title"
          class="w-full h-full object-cover"
          @error="handleImageError"
        >
        
        <!-- 播放按钮遮罩 -->
        <div class="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all duration-300">
          <PlayIcon class="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-all duration-300" />
        </div>

        <!-- 操作菜单 -->
        <div v-if="props.showActions !== false" class="absolute top-2 right-2 z-10 video-action-menu" @click.stop>
          <VideoActionMenu
            :video="video"
            @edit="handleEdit"
            @toggle-status="handleToggleStatus"
            @delete="handleDelete"
          />
        </div>

        <!-- 添加时长显示 -->
        <div v-if="video.duration" class="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 rounded text-xs text-white">
          {{ formatDuration(video.duration) }}
        </div>
      </div>

      <!-- 视频信息 -->
      <div class="p-4">
        <!-- 标题和状态标签放在同一行 -->
        <div class="flex items-start justify-between gap-2 mb-2">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1">
            {{ video.title }}
          </h3>
          <span
            :class="[
              'px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap',
              {
                'bg-green-500/70 text-white': video.status === 'public',
                'bg-gray-900/70 text-white': video.status === 'private',
                'bg-yellow-500/70 text-white': video.status === 'draft'
              }
            ]"
          >
            {{ statusText }}
          </span>
        </div>
        
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
          <span class="flex items-center">
            <DocumentIcon class="w-4 h-4 mr-1" />
            {{ formatFileSize(video.fileSize) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 编辑对话框 -->
    <VideoEditDialog
      :is-open="showEditDialog"
      :video="video"
      @close="showEditDialog = false"
      @success="handleEditSuccess"
    />

    <!-- 删除确认对话框 -->
    <DeleteConfirmDialog
      :is-open="showDeleteDialog"
      :video="video"
      @close="showDeleteDialog = false"
      @success="handleDeleteSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  PlayIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  DocumentIcon
} from '@heroicons/vue/24/outline'
import type { VideoItem } from '../types/video'
import VideoActionMenu from './VideoActionMenu.vue'
import VideoEditDialog from './VideoEditDialog.vue'
import DeleteConfirmDialog from './DeleteConfirmDialog.vue'
import { useVideoStore } from '../stores/video'
import { ASSETS_BASE_URL } from '../api/config'

const props = defineProps<{
  video: VideoItem
  showActions?: boolean // 是否显示操作菜单
  showProgress?: boolean // 是否显示进度条
}>()

const emit = defineEmits<{
  (e: 'update', video: VideoItem): void
  (e: 'delete', video: VideoItem): void
  (e: 'click', event: Event): void
}>()

const showEditDialog = ref(false)
const showDeleteDialog = ref(false)

// 处理编辑
const handleEdit = () => {
  showEditDialog.value = true
}

// 处理编辑成功
const handleEditSuccess = () => {
  emit('update', props.video)
}

// 处理删除
const handleDelete = () => {
  showDeleteDialog.value = true
}

// 处理删除成功
const handleDeleteSuccess = () => {
  emit('delete', props.video)
}

// 处理状态切换
const handleToggleStatus = async () => {
  try {
    const videoStore = useVideoStore()
    const newStatus = props.video.status === 'private' ? 'public' : 'private'
    await videoStore.updateVideo(props.video.id, {
      ...props.video,
      status: newStatus
    })
    emit('update', { ...props.video, status: newStatus })
  } catch (err) {
    console.error('Toggle status failed:', err)
  }
}

// 格式化数字
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// 图片加载失败处理
const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
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

// 状态文本
const statusText = computed(() => {
  switch (props.video.status) {
    case 'public':
      return '已发布'
    case 'private':
      return '私有'
    case 'draft':
      return '草稿'
    default:
      return '未知'
  }
})

const coverImageUrl = computed(() => {
  if (props.video.coverUrl) {
    return `${ASSETS_BASE_URL}${props.video.coverUrl}`
  }
  if (props.video.thumbnailUrl) {
    return `${ASSETS_BASE_URL}${props.video.thumbnailUrl}`
  }
  return null
})

const hasCover = computed(() => {
  return Boolean(props.video.coverUrl || props.video.thumbnailUrl)
})

// 确保组件可以继承 attributes
defineOptions({
  inheritAttrs: false
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