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

                <!-- 登录方式切换 -->
                <div v-if="isLogin" class="mt-4 flex rounded-xl bg-gray-100/70 dark:bg-gray-800/50 p-1">
                  <button 
                    type="button"
                    class="flex-1 py-2 text-sm rounded-lg transition-all focus:outline-none"
                    :class="loginType === 'password' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light'"
                    @click="loginType = 'password'"
                  >
                    密码登录
                  </button>
                  <button 
                    type="button"
                    class="flex-1 py-2 text-sm rounded-lg transition-all focus:outline-none"
                    :class="loginType === 'sms' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light'"
                    @click="loginType = 'sms'"
                  >
                    验证码登录
                  </button>
                </div>

                <!-- 密码登录表单 -->
                <form v-if="isLogin && loginType === 'password'" @submit.prevent="handleSubmit" class="mt-6 space-y-5">
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
                          登录
                        </span>
                      </span>
                    </button>
                  </div>
                </form>

                <!-- 短信验证码登录表单 -->
                <form v-if="isLogin && loginType === 'sms'" @submit.prevent="handleSmsLogin" class="mt-6 space-y-5">
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        手机号码
                      </label>
                      <div class="relative">
                        <input
                          v-model="smsForm.phone"
                          type="tel"
                          required
                          pattern="^1[3-9]\d{9}$"
                          class="w-full h-12 pl-12 pr-4 rounded-2xl bg-gray-100/50 dark:bg-gray-800/50 border-0 focus:ring-2 focus:ring-primary/30 dark:text-white transition duration-200"
                          :class="{'ring-2 ring-red-500/30': errors.phone}"
                          placeholder="请输入手机号码"
                        />
                        <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                          <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                      </div>
                      <p v-if="errors.phone" class="mt-1.5 text-xs text-red-500">{{ errors.phone }}</p>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        验证码
                      </label>
                      <div class="relative">
                        <input
                          v-model="smsForm.code"
                          type="text"
                          required
                          class="w-full h-12 pl-12 pr-[110px] rounded-2xl bg-gray-100/50 dark:bg-gray-800/50 border-0 focus:ring-2 focus:ring-primary/30 dark:text-white transition duration-200"
                          :class="{'ring-2 ring-red-500/30': errors.code}"
                          placeholder="请输入验证码"
                        />
                        <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                          <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                          </svg>
                        </div>
                        <button 
                          type="button"
                          @click="sendSmsCode"
                          :disabled="isSending || cooldown > 0 || !smsForm.phone || !phoneRegex.test(smsForm.phone)"
                          class="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 px-3 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-primary hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {{ cooldown > 0 ? `${cooldown}秒` : '获取验证码' }}
                        </button>
                      </div>
                      <p v-if="errors.code" class="mt-1.5 text-xs text-red-500">{{ errors.code }}</p>
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
                          登录
                        </span>
                      </span>
                    </button>
                  </div>
                </form>

                <!-- 注册表单 -->
                <form v-if="!isLogin" @submit.prevent="handleSubmit" class="mt-6 space-y-5">
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

                    <div>
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
                          注册
                        </span>
                      </span>
                    </button>
                  </div>
                </form>

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
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted } from 'vue'
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
const loginType = ref('password') // 'password' 或 'sms'
const isLoading = ref(false)
const isSending = ref(false)
const cooldown = ref(0)
const phoneRegex = /^1[3-9]\d{9}$/

// 密码登录表单
const form = reactive({
  username: '',
  email: '',
  password: ''
})

// 短信登录表单
const smsForm = reactive({
  phone: '',
  code: ''
})

// 错误信息
const errors = reactive({
  username: '',
  email: '',
  password: '',
  phone: '',
  code: ''
})

// 倒计时定时器
let timer: number | null = null

const toggleMode = () => {
  isLogin.value = !isLogin.value
  loginType.value = 'password'
  // 清空表单和错误
  Object.keys(form).forEach(key => form[key as keyof typeof form] = '')
  Object.keys(smsForm).forEach(key => smsForm[key as keyof typeof smsForm] = '')
  Object.keys(errors).forEach(key => errors[key as keyof typeof errors] = '')
}

const closeModal = () => {
  emit('close')
}

// 发送短信验证码
const sendSmsCode = async () => {
  if (!phoneRegex.test(smsForm.phone)) {
    errors.phone = '请输入正确的手机号'
    return
  }
  
  errors.phone = ''
  isSending.value = true
  
  try {
    const success = await userStore.sendSmsCode(smsForm.phone)
    if (success) {
      // 开始倒计时
      cooldown.value = 60
      timer = window.setInterval(() => {
        cooldown.value--
        if (cooldown.value <= 0) {
          clearInterval(timer as number)
          timer = null
        }
      }, 1000)
    }
  } finally {
    isSending.value = false
  }
}

// 密码登录或注册处理
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
    
    emit('success')
  } catch (error: any) {
    // 处理表单错误
    if (error.response?.data?.errors) {
      Object.assign(errors, error.response.data.errors)
    } else if (error.response?.data?.msg) {
      message.error(error.response.data.msg)
    } else {
      message.error(error.message || (isLogin.value ? '登录失败' : '注册失败'))
    }
  } finally {
    isLoading.value = false
  }
}

// 短信验证码登录处理
const handleSmsLogin = async () => {
  try {
    isLoading.value = true
    // 清空错误
    errors.phone = ''
    errors.code = ''
    
    if (!phoneRegex.test(smsForm.phone)) {
      errors.phone = '请输入正确的手机号'
      isLoading.value = false
      return
    }
    
    if (!smsForm.code) {
      errors.code = '请输入验证码'
      isLoading.value = false
      return
    }
    
    const success = await userStore.smsLogin({
      phone: smsForm.phone,
      code: smsForm.code
    })
    
    if (success) {
      emit('success')
    }
  } catch (error: any) {
    // 处理表单错误
    if (error.response?.data?.errors) {
      Object.assign(errors, error.response.data.errors)
    } else if (error.response?.data?.msg) {
      message.error(error.response.data.msg)
    } else {
      message.error(error.message || '登录失败')
    }
  } finally {
    isLoading.value = false
  }
}

// 清理定时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script> 