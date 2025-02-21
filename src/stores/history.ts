import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { VideoItem } from '../types/video'

interface HistoryItem {
  videoId: string
  title: string
  timestamp: number
  progress: number
}

export const useHistoryStore = defineStore('history', () => {
  const history = ref<HistoryItem[]>([])

  // 从 localStorage 加载历史记录
  const loadHistory = () => {
    const saved = localStorage.getItem('videoHistory')
    if (saved) {
      history.value = JSON.parse(saved)
    }
  }

  // 添加观看记录
  const addHistory = (video: VideoItem, progress: number) => {
    const item: HistoryItem = {
      videoId: video.id,
      title: video.title,
      timestamp: Date.now(),
      progress
    }

    // 移除旧的相同视频记录
    history.value = history.value.filter(h => h.videoId !== video.id)
    
    // 添加新记录到开头
    history.value.unshift(item)
    
    // 只保留最近50条记录
    history.value = history.value.slice(0, 50)
    
    // 保存到 localStorage
    localStorage.setItem('videoHistory', JSON.stringify(history.value))
  }

  return {
    history,
    loadHistory,
    addHistory
  }
}) 