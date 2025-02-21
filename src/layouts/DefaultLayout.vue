<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
    <!-- 导航栏 -->
    <nav class="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-black/80 border-b border-gray-200 dark:border-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <router-link to="/" class="text-2xl font-bold bg-gradient-to-r from-primary-light via-primary to-primary-dark bg-clip-text text-transparent">
              VideoHub
            </router-link>
          </div>

          <!-- 搜索框 -->
          <div class="flex-1 max-w-2xl mx-4 hidden md:flex items-center">
            <div class="w-full relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索视频..."
                @input="handleSearch"
                class="w-full px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-transparent focus:border-primary-light dark:focus:border-primary-dark outline-none transition-all duration-300"
              >
              <!-- 搜索结果下拉框 -->
              <div v-if="searchQuery && searchResults.length > 0" 
                class="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <router-link
                  v-for="result in searchResults"
                  :key="result.id"
                  :to="`/video/${result.id}`"
                  class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  @click="searchQuery = ''"
                >
                  {{ result.title }}
                </router-link>
              </div>
            </div>
          </div>

          <!-- 右侧按钮组 -->
          <div class="flex items-center space-x-4">
            <!-- 视频管理入口 -->
            <router-link
              to="/manage"
              class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-dark dark:hover:text-primary-light transition-colors duration-300"
            >
              <FolderIcon class="w-5 h-5 mr-2" />
              视频管理
            </router-link>

            <!-- 上传按钮 -->
            <button
              @click="showUploadDialog = true"
              class="flex items-center px-4 py-2 bg-gradient-to-r from-primary-light to-primary-dark text-white rounded-full hover:shadow-lg transition-all duration-300"
            >
              <PlusIcon class="w-5 h-5 mr-2" />
              上传视频
            </button>

            <!-- 主题切换 -->
            <button
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
    <UploadDialog 
      :is-open="showUploadDialog"
      @close="showUploadDialog = false"
      @success="handleUploadSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useVideoStore } from '../stores/video'
import { useThemeStore } from '../stores/theme'
import {
  PlusIcon,
  SunIcon,
  MoonIcon,
  FolderIcon
} from '@heroicons/vue/24/outline'
import UploadDialog from '../components/UploadDialog.vue'

const router = useRouter()
const videoStore = useVideoStore()
const themeStore = useThemeStore()
const showUploadDialog = ref(false)
const searchQuery = ref('')
const searchResults = ref([])

const handleUploadSuccess = async () => {
  showUploadDialog.value = false
  
  // 获取当前路由名称
  const currentRoute = router.currentRoute.value.name

  // 根据当前页面刷新视频列表
  if (currentRoute === 'manage') {
    // 如果在管理页面，调用管理页面的刷新方法
    const manageView = document.querySelector('.video-manage-view')
    if (manageView && manageView.__vue__) {
      await manageView.__vue__.loadVideos()
    } else {
      // 如果无法获取组件实例，则重新加载整个视频列表
      await videoStore.fetchVideos(1, 12)
    }
  } else if (currentRoute === 'home') {
    // 如果在首页，刷新首页视频列表
    const homeView = document.querySelector('.home-view')
    if (homeView && homeView.__vue__) {
      await homeView.__vue__.loadVideos()
    } else {
      await videoStore.fetchVideos(1, 12)
    }
  }
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
</script> 