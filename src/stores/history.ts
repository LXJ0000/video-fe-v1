import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { VideoItem } from '../types/video'

interface HistoryItem {
  videoId: string
  title: string
  timestamp: number
  progress: number  // 播放进度（秒）
  duration: number  // 视频总时长（秒）
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

  // 添加/更新观看记录
  const updateHistory = (video: VideoItem, progress: number) => {
    const item: HistoryItem = {
      videoId: video.id,
      title: video.title,
      timestamp: Date.now(),
      progress,
      duration: video.duration
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

  // 获取视频播放进度
  const getVideoProgress = (videoId: string): number => {
    const item = history.value.find(h => h.videoId === videoId)
    return item?.progress || 0
  }

  return {
    history,
    loadHistory,
    updateHistory,
    getVideoProgress
  }
}) 