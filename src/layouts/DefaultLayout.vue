<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
    <!-- 导航栏 -->
    <nav
      class="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-black/80 border-b border-gray-200 dark:border-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <router-link to="/"
              class="text-2xl font-bold bg-gradient-to-r from-primary-light via-primary to-primary-dark bg-clip-text text-transparent">
              VideoHub
            </router-link>
          </div>

          <!-- 搜索框 -->
          <div class="flex-1 max-w-2xl mx-4 hidden md:flex items-center">
            <div class="w-full relative">
              <input v-model="searchQuery" type="text" placeholder="搜索视频..." @input="handleSearch"
                class="w-full px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-transparent focus:border-primary-light dark:focus:border-primary-dark outline-none transition-all duration-300">
              <!-- 搜索结果下拉框 -->
              <div v-if="searchQuery && searchResults.length > 0"
                class="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <router-link v-for="result in searchResults" :key="result.id" :to="`/video/${result.id}`"
                  class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700" @click="searchQuery = ''">
                  {{ result.title }}
                </router-link>
              </div>
            </div>
          </div>

          <!-- 右侧按钮组 -->
          <div class="flex items-center space-x-4">
            <!-- 未登录状态 -->
            <template v-if="!userStore.isAuthenticated">
              <button @click="showAuthModal = true"
                class="px-4 py-2 bg-gradient-to-r from-primary-light to-primary-dark text-white rounded-full hover:shadow-lg transition-all duration-300">
                登录 / 注册
              </button>
            </template>

            <!-- 已登录状态 -->
            <template v-else>
              <!-- 用户菜单 -->
              <Menu as="div" class="relative ml-3">
                <MenuButton
                  class="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary-dark dark:hover:text-primary-light">
                  <span>{{ userStore.currentUser?.username }}</span>
                  <ChevronDownIcon class="w-4 h-4" />
                </MenuButton>

                <transition enter-active-class="transition ease-out duration-100" enter-from-class="opacity-0 scale-95"
                  enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-75"
                  leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
                  <MenuItems
                    class="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <MenuItem v-slot="{ active }">
                    <router-link to="/manage" :class="[
                      active ? 'bg-gray-100 dark:bg-gray-700' : '',
                      'block px-4 py-2 text-sm text-gray-700 dark:text-gray-300'
                    ]">
                      视频管理
                    </router-link>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                    <router-link 
                      :to="`/profile/${userStore.currentUser?.id}`" 
                      :class="[
                        active ? 'bg-gray-100 dark:bg-gray-700' : '',
                        'block px-4 py-2 text-sm text-gray-700 dark:text-gray-300'
                      ]"
                    >
                      个人主页
                    </router-link>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                    <a href="#" @click.prevent="handleLogout" :class="[
                      active ? 'bg-gray-100 dark:bg-gray-700' : '',
                      'block px-4 py-2 text-sm text-gray-700 dark:text-gray-300'
                    ]">
                      退出登录
                    </a>
                    </MenuItem>
                  </MenuItems>
                </transition>
              </Menu>
            </template>

            <!-- 上传按钮 -->
            <button v-if="userStore.isAuthenticated" @click="showUploadDialog = true"
              class="flex items-center px-4 py-2 bg-gradient-to-r from-primary-light to-primary-dark text-white rounded-full hover:shadow-lg transition-all duration-300">
              <PlusIcon :class="[
                'w-5 h-5',
                'sm:mr-2'
              ]" />
              <span class="hidden sm:inline">上传视频</span> <!-- 在小屏幕上隐藏文字 -->
            </button>
             <!-- 导航链接 -->
             <div class="flex items-center ml-4 mr-auto">
              <router-link to="/feed" class="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-dark dark:hover:text-primary-light transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span class="hidden sm:inline">视频流</span>
              </router-link>
            </div>
            <!-- 主题切换 -->
            <button 
              v-if="!isVideoFeedPage"
              @click="themeStore.toggleTheme"
              class="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors duration-300"
            >
              <SunIcon v-if="themeStore.isDark" class="w-5 h-5" />
              <MoonIcon v-else class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要内容区域 -->
    <div class="pt-16">
      <slot />
    </div>

    <!-- 上传对话框 -->
    <UploadDialog :is-open="showUploadDialog" @close="showUploadDialog = false" @success="handleUploadSuccess" />

    <!-- 添加 AuthModal -->
    <AuthModal :is-open="showAuthModal" @close="showAuthModal = false" @success="handleAuthSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, inject, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useVideoStore } from '@/stores/video'
import { useThemeStore } from '@/stores/theme'
import { useUserStore } from '@/stores/user'
import {
  PlusIcon,
  SunIcon,
  MoonIcon,
  FolderIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline'
import UploadDialog from '@/components/UploadDialog.vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import AuthModal from '@/components/AuthModal.vue'

const router = useRouter()
const route = useRoute()
const videoStore = useVideoStore()
const themeStore = useThemeStore()
const userStore = useUserStore()
const showUploadDialog = ref(false)
const searchQuery = ref('')
const searchResults = ref([])
const showAuthModal = ref(false)

const isVideoFeedPage = computed(() => route.name === 'feed')

const handleUploadSuccess = async () => {
  showUploadDialog.value = false

  // 直接刷新视频列表，不再尝试访问组件实例
  await videoStore.fetchVideos(1, 12)

  // 发出全局事件通知组件更新
  window.dispatchEvent(new CustomEvent('video-uploaded'))
}

// 简单的搜索实现
const handleSearch = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  // 在现有视频中搜索
  searchResults.value = videoStore.videos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    video.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  ).slice(0, 5) // 最多显示5条结果
}

const handleLogout = () => {
  userStore.logout()
}

const handleAuthSuccess = () => {
  showAuthModal.value = false
}
</script>