<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-50">
      <!-- 背景蒙层 -->
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30 backdrop-blur-2xl" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 sm:p-6">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel 
              class="relative w-full max-w-[380px] transform overflow-hidden rounded-[24px] bg-white/90 dark:bg-gray-900/90 p-6 sm:p-8 shadow-2xl transition-all"
            >
              <!-- 背景装饰 -->
              <div class="absolute inset-0 bg-gradient-to-br from-primary-light/10 via-transparent to-primary/5 backdrop-blur-xl" />
              
              <!-- 内容区域 -->
              <div class="relative">
                <!-- Logo -->
                <div class="text-center">
                  <div class="inline-flex items-center justify-center w-14 h-14 rounded-[16px] bg-gradient-to-br from-primary-light to-primary mb-5">
                    <svg class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <DialogTitle as="h3" class="text-xl font-bold text-gray-900 dark:text-white">
                    {{ isLogin ? '欢迎回来' : '创建账号' }}
                  </DialogTitle>
                  <p class="mt-1.5 text-sm text-gray-600 dark:text-gray-400">
                    {{ isLogin ? '登录以继续您的学习之旅' : '加入我们，开启您的学习之旅' }}
                  </p>
                </div>

                <!-- 表单 -->
                <form @submit.prevent="handleSubmit" class="mt-6 space-y-5">
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        用户名
                      </label>
                      <div class="relative">
                        <input
                          v-model="form.username"
                          type="text"
                          required
                          class="w-full h-12 pl-12 pr-4 rounded-2xl bg-gray-100/50 dark:bg-gray-800/50 border-0 focus:ring-2 focus:ring-primary/30 dark:text-white transition duration-200"
                          :class="{'ring-2 ring-red-500/30': errors.username}"
                          placeholder="请输入用户名"
                        />
                        <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                          <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                      <p v-if="errors.username" class="mt-1.5 text-xs text-red-500">{{ errors.username }}</p>
                    </div>

                    <div v-if="!isLogin">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        邮箱
                      </label>
                      <div class="relative">
                        <input
                          v-model="form.email"
                          type="email"
                          required
                          class="w-full h-12 pl-12 pr-4 rounded-2xl bg-gray-100/50 dark:bg-gray-800/50 border-0 focus:ring-2 focus:ring-primary/30 dark:text-white transition duration-200"
                          :class="{'ring-2 ring-red-500/30': errors.email}"
                          placeholder="请输入邮箱"
                        />
                        <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                          <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      <p v-if="errors.email" class="mt-1.5 text-xs text-red-500">{{ errors.email }}</p>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        密码
                      </label>
                      <div class="relative">
                        <input
                          v-model="form.password"
                          type="password"
                          required
                          class="w-full h-12 pl-12 pr-4 rounded-2xl bg-gray-100/50 dark:bg-gray-800/50 border-0 focus:ring-2 focus:ring-primary/30 dark:text-white transition duration-200"
                          :class="{'ring-2 ring-red-500/30': errors.password}"
                          placeholder="请输入密码"
                        />
                        <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                          <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      </div>
                      <p v-if="errors.password" class="mt-1.5 text-xs text-red-500">{{ errors.password }}</p>
                    </div>
                  </div>

                  <div class="pt-2">
                    <button
                      type="submit"
                      class="relative w-full h-11 rounded-2xl bg-gradient-to-r from-primary-light to-primary text-white font-medium shadow-lg shadow-primary/30 hover:shadow-primary/50 focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
                      :disabled="isLoading"
                    >
                      <span 
                        class="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      />
                      <span class="relative">
                        <span v-if="isLoading" class="flex items-center justify-center">
                          <svg class="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          处理中...
                        </span>
                        <span v-else>
                          {{ isLogin ? '登录' : '注册' }}
                        </span>
                      </span>
                    </button>

                    <div class="text-center mt-4">
                      <button
                        type="button"
                        class="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light transition-colors duration-200"
                        @click="toggleMode"
                      >
                        {{ isLogin ? '还没有账号？立即注册' : '已有账号？立即登录' }}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import { useUserStore } from '@/stores/user'
import { message } from '@/utils/message'

const props = defineProps<{
  isOpen: boolean
  redirect?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const userStore = useUserStore()
const isLogin = ref(true)
const isLoading = ref(false)

const form = reactive({
  username: '',
  email: '',
  password: ''
})

const errors = reactive({
  username: '',
  email: '',
  password: ''
})

const toggleMode = () => {
  isLogin.value = !isLogin.value
  // 清空表单和错误
  Object.keys(form).forEach(key => form[key as keyof typeof form] = '')
  Object.keys(errors).forEach(key => errors[key as keyof typeof errors] = '')
}

const closeModal = () => {
  emit('close')
}

const handleSubmit = async () => {
  try {
    isLoading.value = true
    // 清空错误
    Object.keys(errors).forEach(key => errors[key as keyof typeof errors] = '')
    
    if (isLogin.value) {
      await userStore.login({
        username: form.username,
        password: form.password
      })
    } else {
      await userStore.register({
        username: form.username,
        email: form.email,
        password: form.password
      })
    }
    
    message.success(isLogin.value ? '登录成功' : '注册成功')
    emit('success')
  } catch (error: any) {
    // 处理表单错误
    if (error.response?.data?.errors) {
      Object.assign(errors, error.response.data.errors)
    } else {
      message.error(error.message || (isLogin.value ? '登录失败' : '注册失败'))
    }
  } finally {
    isLoading.value = false
  }
}
</script> 