<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeDialog" class="relative z-50">
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
            <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
              <!-- 标题 -->
              <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                确认删除
              </DialogTitle>

              <!-- 内容 -->
              <div class="mt-2">
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  确定要删除视频 "{{ video.title }}" 吗？此操作无法撤销。
                </p>
              </div>

              <!-- 加载状态 -->
              <div v-if="isLoading" class="mt-4 flex justify-center">
                <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary-light border-t-transparent"></div>
              </div>

              <!-- 错误提示 -->
              <p v-if="error" class="mt-4 text-sm text-red-500">{{ error }}</p>

              <!-- 操作按钮 -->
              <div class="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  @click="closeDialog"
                  class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  :disabled="isLoading"
                >
                  取消
                </button>
                <button
                  type="button"
                  @click="handleConfirm"
                  class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
                  :disabled="isLoading"
                >
                  删除
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionRoot,
  TransitionChild,
} from '@headlessui/vue'
import type { VideoItem } from '../types/video'
import { useVideoStore } from '../stores/video'

const props = defineProps<{
  isOpen: boolean
  video: VideoItem
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const videoStore = useVideoStore()
const isLoading = ref(false)
const error = ref('')

const closeDialog = () => {
  error.value = ''
  emit('close')
}

const handleConfirm = async () => {
  try {
    isLoading.value = true
    error.value = ''
    await videoStore.deleteVideo(props.video.id)
    emit('success')
    closeDialog()
  } catch (err) {
    error.value = '删除失败，请重试'
    console.error('Delete video failed:', err)
  } finally {
    isLoading.value = false
  }
}
</script> 