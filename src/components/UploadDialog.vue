<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-50">
      <!-- 背景遮罩 -->
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      </TransitionChild>

      <!-- 对话框 -->
      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
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
                class="text-lg font-medium leading-6 text-gray-900 dark:text-white"
              >
                上传视频
              </DialogTitle>

              <!-- 上传表单 -->
              <form @submit.prevent="handleUpload" class="mt-4 space-y-4">
                <!-- 拖拽上传区域 -->
                <div
                  class="relative border-2 border-dashed rounded-lg p-8 text-center flex flex-col items-center justify-center min-h-[200px]"
                  :class="[
                    isDragging ? 'border-primary-light bg-primary-light/10' : 'border-gray-300 dark:border-gray-600',
                    'hover:border-primary-light hover:bg-primary-light/5 transition-colors duration-200'
                  ]"
                  @dragover.prevent="isDragging = true"
                  @dragleave.prevent="isDragging = false"
                  @drop.prevent="handleDrop"
                >
                  <div v-if="!selectedFile" class="w-full flex flex-col items-center">
                    <svg
                      class="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <div class="mt-4 flex text-sm text-gray-600 dark:text-gray-400">
                      <label
                        class="relative cursor-pointer rounded-md font-medium text-primary-light hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-light"
                      >
                        <span>选择视频文件</span>
                        <input
                          type="file"
                          class="sr-only"
                          accept="video/*"
                          @change="handleFileSelect"
                        >
                      </label>
                      <p class="pl-1">或拖放文件到这里</p>
                    </div>
                    <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      支持 MP4、MOV、AVI 等格式，最大 1GB
                    </p>
                  </div>
                  <div v-else class="text-left">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-2">
                        <svg class="h-6 w-6 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                        <span class="text-sm font-medium text-gray-900 dark:text-white">
                          {{ selectedFile.name }}
                        </span>
                      </div>
                      <button
                        type="button"
                        class="text-sm text-red-500 hover:text-red-700"
                        @click="selectedFile = null"
                      >
                        移除
                      </button>
                    </div>
                    <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {{ formatFileSize(selectedFile.size) }}
                    </div>
                  </div>
                </div>

                <!-- 标题和描述 -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    视频标题
                  </label>
                  <input
                    type="text"
                    v-model="title"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    视频描述
                  </label>
                  <textarea
                    v-model="description"
                    rows="3"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  ></textarea>
                </div>

                <!-- 封面图上传 -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    视频封面
                  </label>
                  
                  <!-- 封面类型选择 -->
                  <div class="flex flex-wrap gap-3 mb-3">
                    <label 
                      v-for="type in coverTypes" 
                      :key="type.value"
                      class="inline-flex items-center px-4 py-2 rounded-full border-2 cursor-pointer transition-all duration-200"
                      :class="[
                        coverType === type.value
                          ? 'border-primary-light bg-primary-light/10 text-primary-light'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-light/50'
                      ]"
                    >
                      <input
                        type="radio"
                        v-model="coverType"
                        :value="type.value"
                        class="hidden"
                      >
                      <component :is="type.icon" class="w-4 h-4 mr-2" />
                      <span class="text-sm">{{ type.label }}</span>
                    </label>
                  </div>

                  <!-- 自定义封面上传区域 -->
                  <div v-if="coverType === 'custom'" 
                    class="relative border-2 border-dashed rounded-lg p-4 transition-all duration-200"
                    :class="[
                      isDraggingCover 
                        ? 'border-primary-light bg-primary-light/10' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary-light/50'
                    ]"
                    @dragenter.prevent="isDraggingCover = true"
                    @dragleave.prevent="isDraggingCover = false"
                    @dragover.prevent
                    @drop.prevent="handleCoverDrop"
                  >
                    <div class="flex items-start space-x-4">
                      <!-- 预览区域 -->
                      <div class="relative w-40 h-24 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                        <img
                          v-if="coverPreview"
                          :src="coverPreview"
                          class="w-full h-full object-cover"
                          alt="封面预览"
                        >
                        <div v-else class="w-full h-full flex flex-col items-center justify-center text-gray-400">
                          <PhotoIcon class="w-8 h-8 mb-1" />
                          <span class="text-xs">暂无封面</span>
                        </div>
                      </div>
                      
                      <!-- 上传区域 -->
                      <div class="flex-1">
                        <div class="flex items-center space-x-2">
                          <input
                            type="file"
                            ref="coverInput"
                            class="hidden"
                            accept="image/jpeg,image/png"
                            @change="handleCoverSelect"
                          >
                          <button
                            type="button"
                            class="px-4 py-2 bg-primary-light text-white text-sm rounded-full hover:bg-primary transition-colors duration-200"
                            @click="coverInput?.click()"
                          >
                            选择图片
                          </button>
                          <button
                            v-if="coverFile"
                            type="button"
                            class="px-4 py-2 text-sm text-red-500 hover:text-red-600"
                            @click="removeCover"
                          >
                            移除
                          </button>
                        </div>
                        <p class="mt-2 text-sm text-gray-500">
                          支持拖拽上传，可使用 JPG、PNG 格式图片，最大 2MB
                        </p>
                        <p v-if="coverFile" class="mt-1 text-sm text-gray-500">
                          已选择: {{ coverFile.name }} ({{ formatFileSize(coverFile.size) }})
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 上传进度 -->
                <div v-if="videoStore.isUploading" class="space-y-2">
                  <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-gradient-to-r from-primary-light to-primary-dark transition-all duration-300"
                      :style="{ width: `${videoStore.uploadProgress}%` }"
                    ></div>
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    上传进度: {{ videoStore.uploadProgress }}%
                  </div>
                </div>

                <!-- 操作按钮 -->
                <div class="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
                    @click="closeModal"
                    :disabled="videoStore.isUploading"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    class="btn-primary"
                    :disabled="!selectedFile || videoStore.isUploading"
                  >
                    {{ videoStore.isUploading ? '上传中...' : '开始上传' }}
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import { useVideoStore } from '../stores/video'
import { API_CONFIG, type AllowedImageType } from '../api/config'
import type { VideoStatus } from '../types/video'
import { 
  PhotoIcon, 
  DocumentDuplicateIcon,
  Square2StackIcon 
} from '@heroicons/vue/24/outline'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const videoStore = useVideoStore()
const isDragging = ref(false)
const selectedFile = ref<File | null>(null)
const title = ref('')
const description = ref('')
const coverInput = ref<HTMLInputElement | null>(null)
const coverFile = ref<File | null>(null)
const coverPreview = ref<string>('')
const coverType = ref<'default' | 'custom'>('default')

// 封面类型选项
const coverTypes = [
  { value: 'default', label: '默认封面', icon: DocumentDuplicateIcon },
  { value: 'custom', label: '自定义上传', icon: Square2StackIcon }
] as const

type CoverType = typeof coverTypes[number]['value']

const isDraggingCover = ref(false)

const closeModal = () => {
  if (!videoStore.isUploading) {
    emit('close')
    resetForm()
  }
}

const resetForm = () => {
  selectedFile.value = null
  title.value = ''
  description.value = ''
  isDragging.value = false
  coverFile.value = null
  coverPreview.value = ''
  if (coverInput.value) {
    coverInput.value.value = ''
  }
  coverType.value = 'default'
}

const checkFileType = (file: File): boolean => {
  const allowedTypes = API_CONFIG.ALLOWED_VIDEO_TYPES as readonly string[]
  return allowedTypes.includes(file.type)
}

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (file) {
    // 检查文件格式
    if (!checkFileType(file)) {
      alert(`不支持的视频格式。支持的格式：${API_CONFIG.ALLOWED_VIDEO_TYPES.map(type => type.split('/')[1]).join(', ')}`)
      input.value = '' // 清空选择
      return
    }
    
    // 检查文件大小
    if (file.size > API_CONFIG.MAX_FILE_SIZE) {
      alert('文件大小超过限制（最大1GB）')
      input.value = '' // 清空选择
      return
    }
    
    selectedFile.value = file
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files?.length) {
    const file = files[0]
    
    // 使用相同的 checkFileType 函数检查文件类型
    if (!checkFileType(file)) {
      alert(`不支持的视频格式。支持的格式：${API_CONFIG.ALLOWED_VIDEO_TYPES.map(type => type.split('/')[1]).join(', ')}`)
      return
    }
    
    // 检查文件大小
    if (file.size > API_CONFIG.MAX_FILE_SIZE) {
      alert('文件大小超过限制（最大1GB）')
      return
    }
    
    selectedFile.value = file
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleCoverSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (file) {
    // 检查文件类型
    if (!API_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type as AllowedImageType)) {
      alert('不支持的图片格式。仅支持 JPG、PNG 格式')
      input.value = ''
      return
    }
    
    // 检查文件大小
    if (file.size > API_CONFIG.MAX_THUMBNAIL_SIZE) {
      alert('图片大小超过限制（最大2MB）')
      input.value = ''
      return
    }
    
    coverFile.value = file
    coverPreview.value = URL.createObjectURL(file)
  }
}

const removeCover = () => {
  coverFile.value = null
  coverPreview.value = ''
  if (coverInput.value) {
    coverInput.value.value = ''
  }
}

// 处理封面拖拽
const handleCoverDrop = (event: DragEvent) => {
  isDraggingCover.value = false
  const file = event.dataTransfer?.files[0]
  
  if (file) {
    // 检查文件类型
    if (!API_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type as AllowedImageType)) {
      alert('不支持的图片格式。仅支持 JPG、PNG 格式')
      return
    }
    
    // 检查文件大小
    if (file.size > API_CONFIG.MAX_THUMBNAIL_SIZE) {
      alert('图片大小超过限制（最大2MB）')
      return
    }
    
    coverFile.value = file
    coverPreview.value = URL.createObjectURL(file)
  }
}

// 获取视频时长
const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src)
      resolve(Math.floor(video.duration))
    }
    video.src = URL.createObjectURL(file)
  })
}

// 修改上传处理函数
const handleUpload = async () => {
  if (!selectedFile.value) return
  if (!title.value.trim()) {
    alert('请输入视频标题')
    return
  }

  try {
    // 获取视频时长
    const duration = await getVideoDuration(selectedFile.value)
    
    // 构建上传数据
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('title', title.value.trim())
    formData.append('description', description.value.trim())
    formData.append('duration', duration.toString())  // 使用 duration 字段
    
    // 处理封面
    if (coverType.value === 'custom' && coverFile.value) {
      formData.append('cover', coverFile.value)
    }

    // 上传视频
    await videoStore.uploadVideo(
      selectedFile.value,
      title.value.trim(),
      description.value.trim(),
      {
        cover: coverType.value === 'custom' ? coverFile.value : undefined,
        duration  // 使用 duration 字段
      }
    )

    emit('success')
    closeModal()
  } catch (error) {
    console.error('Upload failed:', error)
    alert('上传失败，请重试')
  }
}

// 组件卸载时清理预览URL
onUnmounted(() => {
  if (coverPreview.value) {
    URL.revokeObjectURL(coverPreview.value)
  }
})
</script>

<style scoped>
.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}
</style> 