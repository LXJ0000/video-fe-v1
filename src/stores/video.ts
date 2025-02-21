import { defineStore } from 'pinia'
import { ref } from 'vue'
import { videoApi } from '../api/video'
import type { VideoItem, VideoListParams, VideoListResponse, VideoStatus } from '../types/video'

// 定义更新视频的参数类型
interface UpdateVideoParams {
  title?: string
  description?: string
  status?: VideoStatus
  tags?: string[]
}

export const useVideoStore = defineStore('video', () => {
  const isUploading = ref(false)
  const uploadProgress = ref(0)
  const videos = ref<VideoItem[]>([])

  // 上传视频
  const uploadVideo = async (file: File, title: string, description: string, options?: {
    cover?: File
    duration?: number
  }) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', title)
    formData.append('description', description)
    
    // 添加时长
    if (options?.duration) {
      formData.append('duration', options.duration.toString())
    }

    // 添加封面
    if (options?.cover) {
      formData.append('cover', options.cover)
    }

    try {
      isUploading.value = true
      const response = await videoApi.uploadVideo(formData, (progressEvent) => {
        if (progressEvent.total) {
          uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        }
      })
      return response.data
    } catch (error) {
      console.error('Upload failed:', error)
      throw error
    } finally {
      isUploading.value = false
      uploadProgress.value = 0
    }
  }

  // 获取视频列表
  const fetchVideos = async (page = 1, pageSize = 12, params: Partial<VideoListParams> = {}) => {
    try {
      const response = await videoApi.getVideos({
        page,
        pageSize,
        ...params
      })
      
      // 处理空数据情况
      const newVideos = response.data.data.items || []
      
      // 第一页时替换，其他页面追加
      if (page === 1) {
        videos.value = newVideos
      } else {
        videos.value = [...videos.value, ...newVideos]
      }
      
      return response.data
    } catch (error) {
      console.error('Fetch videos failed:', error)
      throw error
    }
  }

  // 更新视频信息
  const updateVideo = async (id: string, params: UpdateVideoParams) => {
    const response = await videoApi.updateVideo(id, params)
    
    // 更新本地状态
    const index = videos.value.findIndex(v => v.id === id)
    if (index !== -1) {
      videos.value[index] = {
        ...videos.value[index],
        ...params
      }
    }
    
    return response.data
  }

  // 删除视频
  const deleteVideo = async (id: string) => {
    await videoApi.deleteVideo(id)
    // 从本地状态中移除
    videos.value = videos.value.filter(v => v.id !== id)
  }

  // 批量操作视频
  const batchUpdateVideos = async (ids: string[], action: 'delete' | 'update_status', status?: VideoStatus) => {
    const response = await videoApi.batchOperation({
      ids,
      action,
      status
    })

    // 更新本地状态
    if (action === 'delete') {
      videos.value = videos.value.filter(v => !ids.includes(v.id))
    } else if (action === 'update_status' && status) {
      videos.value = videos.value.map(v => {
        if (ids.includes(v.id)) {
          return { ...v, status: status as VideoStatus }
        }
        return v
      })
    }

    return response.data
  }

  return {
    isUploading,
    uploadProgress,
    videos,
    uploadVideo,
    fetchVideos,
    updateVideo,
    deleteVideo,
    batchUpdateVideos
  }
}) 