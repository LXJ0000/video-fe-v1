<template>
  <div class="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- 标题 -->
      <div class="text-center">
        <h2 class="text-3xl font-bold bg-gradient-to-r from-primary-light via-primary to-primary-dark bg-clip-text text-transparent">
          手机快捷登录
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          使用手机号登录 VideoHub
        </p>
      </div>

      <!-- 登录表单 -->
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm space-y-4">
          <!-- 手机号码输入 -->
          <div>
            <label for="phone" class="sr-only">手机号码</label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              required
              pattern="^1[3-9]\d{9}$"
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-primary-light focus:border-primary-light dark:focus:ring-primary-dark dark:focus:border-primary-dark dark:bg-gray-800 sm:text-sm"
              placeholder="手机号码"
            >
          </div>
          
          <!-- 验证码输入 -->
          <div class="relative">
            <label for="code" class="sr-only">验证码</label>
            <input
              id="code"
              v-model="form.code"
              type="text"
              required
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-primary-light focus:border-primary-light dark:focus:ring-primary-dark dark:focus:border-primary-dark dark:bg-gray-800 sm:text-sm pr-28"
              placeholder="验证码"
            >
            <button 
              type="button"
              @click="sendCode"
              :disabled="isSending || cooldown > 0"
              class="absolute right-1 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-primary-light text-white rounded text-xs font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {{ cooldown > 0 ? `${cooldown}秒后重新获取` : '获取验证码' }}
            </button>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-light hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {{ isLoading ? '登录中...' : '登录' }}
          </button>
        </div>
      </form>

      <!-- 其他登录方式 -->
      <div class="text-center">
        <router-link
          to="/login"
          class="font-medium text-primary-light hover:text-primary dark:text-primary-dark dark:hover:text-primary transition-colors duration-200"
        >
          使用账号密码登录
        </router-link>
        <div class="mt-2">
          <router-link
            to="/register"
            class="font-medium text-primary-light hover:text-primary dark:text-primary-dark dark:hover:text-primary transition-colors duration-200"
          >
            还没有账号？立即注册
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const isLoading = ref(false)
const isSending = ref(false)
const cooldown = ref(0)
let timer: number | null = null

const form = ref({
  phone: '',
  code: ''
})

// 发送验证码
const sendCode = async () => {
  // 手机号验证
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(form.value.phone)) {
    return
  }

  isSending.value = true
  try {
    const success = await userStore.sendSmsCode(form.value.phone)
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

// 登录处理
const handleLogin = async () => {
  isLoading.value = true
  try {
    const success = await userStore.smsLogin(form.value)
    if (success) {
      const redirectPath = route.query.redirect as string || '/'
      router.push(redirectPath)
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