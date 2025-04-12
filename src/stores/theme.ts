import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { usePreferredDark } from '@vueuse/core'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)
  const prefersDark = usePreferredDark()

  // 初始化主题
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else {
      isDark.value = prefersDark.value
    }
    updateTheme()
  }

  // 更新主题
  const updateTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }

  // 切换主题
  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  // 设置特定主题
  const setTheme = (theme: 'dark' | 'light') => {
    isDark.value = theme === 'dark'
  }

  // 监听主题变化
  watch(isDark, () => {
    updateTheme()
  })

  return {
    isDark,
    toggleTheme,
    initTheme,
    setTheme
  }
}) 