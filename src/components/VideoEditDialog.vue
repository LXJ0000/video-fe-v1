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
            <DialogPanel class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
              <form @submit.prevent="handleSubmit">
                <!-- 标题 -->
                <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                  编辑视频
                </DialogTitle>

                <!-- 加载状态 -->
                <div v-if="isLoading" class="flex justify-center py-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary-light border-t-transparent"></div>
                </div>

                <div v-else class="space-y-4">
                  <!-- 标题输入 -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      标题
                    </label>
                    <input
                      type="text"
                      v-model="form.title"
                      class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-primary-light dark:focus:border-primary-dark focus:outline-none focus:ring-1 focus:ring-primary-light dark:focus:ring-primary-dark"
                      :class="{ 'border-red-500 dark:border-red-500': errors.title }"
                    >
                    <p v-if="errors.title" class="mt-1 text-sm text-red-500">{{ errors.title }}</p>
                  </div>

                  <!-- 描述输入 -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      描述
                    </label>
                    <textarea
                      v-model="form.description"
                      rows="4"
                      class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-primary-light dark:focus:border-primary-dark focus:outline-none focus:ring-1 focus:ring-primary-light dark:focus:ring-primary-dark"
                    ></textarea>
                  </div>

                  <!-- 标签输入 -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      标签
                    </label>
                    <div class="flex flex-wrap gap-2">
                      <div
                        v-for="tag in form.tags"
                        :key="tag"
                        class="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1"
                      >
                        <span class="text-sm text-gray-700 dark:text-gray-300">{{ tag }}</span>
                        <button
                          type="button"
                          @click="removeTag(tag)"
                          class="ml-2 text-gray-500 hover:text-red-500"
                        >
                          <XMarkIcon class="h-4 w-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        v-model="newTag"
                        @keydown.enter.prevent="addTag"
                        placeholder="添加标签..."
                        class="flex-grow min-w-[120px] rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1 text-gray-900 dark:text-white focus:border-primary-light dark:focus:border-primary-dark focus:outline-none focus:ring-1 focus:ring-primary-light dark:focus:ring-primary-dark"
                      >
                    </div>
                  </div>

                  <!-- 状态选择 -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      状态
                    </label>
                    <select
                      v-model="form.status"
                      class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-primary-light dark:focus:border-primary-dark focus:outline-none focus:ring-1 focus:ring-primary-light dark:focus:ring-primary-dark"
                    >
                      <option value="public">公开</option>
                      <option value="private">私有</option>
                      <option value="draft">草稿</option>
                    </select>
                  </div>
                </div>

                <!-- 错误提示 -->
                <p v-if="error" class="mt-4 text-sm text-red-500">{{ error }}</p>

                <!-- 操作按钮 -->
                <div class="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    @click="closeDialog"
                    class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    :disabled="isLoading"
                    class="px-4 py-2 bg-primary-light hover:bg-primary text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
                  >
                    保存
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
import { ref, reactive, watch } from 'vue'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionRoot,
  TransitionChild,
} from '@headlessui/vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import type { VideoItem, VideoStatus } from '../types/video'
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
const newTag = ref('')
const errors = reactive({
  title: ''
})

// 修改表单类型
interface EditForm {
  title: string
  description: string
  status: VideoStatus  // 使用 VideoStatus 类型
  tags: string[]
}

// 表单数据
const form = reactive<EditForm>({
  title: props.video.title,
  description: props.video.description,
  status: props.video.status as VideoStatus,  // 添加类型断言
  tags: props.video.tags || []
})

// 监听视频数据变化
watch(() => props.video, (video) => {
  if (video) {
    form.title = video.title
    form.description = video.description || ''
    form.status = video.status as VideoStatus
    form.tags = video.tags || []
  }
}, { immediate: true })

// 添加标签
const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !form.tags.includes(tag)) {
    form.tags.push(tag)
  }
  newTag.value = ''
}

// 移除标签
const removeTag = (tag: string) => {
  form.tags = form.tags.filter(t => t !== tag)
}

// 关闭对话框
const closeDialog = () => {
  error.value = ''
  errors.title = ''
  emit('close')
}

// 提交表单
const handleSubmit = async () => {
  // 表单验证
  errors.title = ''
  if (!form.title.trim()) {
    errors.title = '请输入视频标题'
    return
  }

  try {
    isLoading.value = true
    error.value = ''

    await videoStore.updateVideo(props.video.id, {
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      tags: form.tags
    })

    emit('success')
    closeDialog()
  } catch (err) {
    error.value = '保存失败，请重试'
    console.error('Update video failed:', err)
  } finally {
    isLoading.value = false
  }
}
</script> 