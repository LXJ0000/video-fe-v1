<template>
  <TransitionRoot appear :show="modelValue" as="template">
    <DialogRoot as="div" @close="closeDialog" class="relative z-50">
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
                {{ title }}
              </DialogTitle>

              <!-- 内容 -->
              <div class="mt-2">
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ content }}
                </p>
              </div>

              <!-- 加载状态 -->
              <div v-if="loading" class="mt-4 flex justify-center">
                <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary-light border-t-transparent"></div>
              </div>

              <!-- 操作按钮 -->
              <div class="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  @click="closeDialog"
                  class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  :disabled="loading"
                >
                  取消
                </button>
                <button
                  type="button"
                  @click="handleConfirm"
                  class="px-4 py-2 bg-primary-light hover:bg-primary text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
                  :disabled="loading"
                >
                  确认
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </DialogRoot>
  </TransitionRoot>
</template>

<script setup lang="ts">
import {
  Dialog as DialogRoot,
  DialogPanel,
  DialogTitle,
  TransitionRoot,
  TransitionChild,
} from '@headlessui/vue'

defineProps<{
  modelValue: boolean
  title: string
  content: string
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
}>()

const closeDialog = () => {
  emit('update:modelValue', false)
}

const handleConfirm = () => {
  emit('confirm')
}
</script> 