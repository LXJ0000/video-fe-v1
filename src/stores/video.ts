import { defineStore } from 'pinia'
import { ref } from 'vue'
import { videoApi } from '../api/video'
import type { VideoItem, VideoListParams, VideoListResponse, VideoStatus } from '../types/video'
import { useUserStore } from './user'

// 定义更新视频的参数类型
interface UpdateVideoParams {
  title?: string
  description?: string
  status?: VideoStatus
  tags?: string[]
}

export const useVideoStore = defineStore('video', () => {
  const userStore = useUserStore()
  const isUploading = ref(false)
  const uploadProgress = ref(0)
  
  // 分离两种视频列表
  const videos = ref<VideoItem[]>([]) // 用户视频（管理页面用）
  const publicVideos = ref<VideoItem[]>([]) // 公开视频（首页用）
  
  const total = ref(0)
  const publicTotal = ref(0)
  const currentPage = ref(1)
  const publicCurrentPage = ref(1)
  const isLoading = ref(false)
  const message = ref('')

  // 上传视频
  const uploadVideo = async (file: File, title: string, description: string, options?: {
    cover?: File
    duration?: number
  }) => {
    if (!userStore.isAuthenticated) {
      throw new Error('用户未登录')
    }
    
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

  // 获取用户视频列表（管理页面用）
  const fetchVideos = async (page = 1, pageSize = 12, params: Partial<VideoListParams> = {}) => {
    try {
      if (!userStore.currentUser) {
        throw new Error('用户未登录')
      }
      
      isLoading.value = true
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
      
      total.value = response.data.data.total || 0
      currentPage.value = page
      
      return response.data
    } catch (error) {
      console.error('Fetch videos failed:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 获取公开视频列表（首页用）
  const fetchPublicVideos = async (page = 1, pageSize = 12, options: {
    userId?: string
    sort?: string
    keyword?: string
  } = {}) => {
    try {
      isLoading.value = true
      const { data } = await videoApi.getPublicVideos({
        page,
        pageSize,
        ...options
      })
      
      if (data.code === 0) {
        // 使用单独的状态存储公开视频
        if (page === 1) {
          publicVideos.value = data.data.items || []
        } else {
          publicVideos.value = [...publicVideos.value, ...(data.data.items || [])]
        }
        
        publicTotal.value = data.data.total || 0
        publicCurrentPage.value = page
      } else {
        message.value = data.msg || '获取视频列表失败'
      }
      
      return data
    } catch (error) {
      console.error('Failed to fetch public videos:', error)
      message.value = '获取视频列表失败'
    } finally {
      isLoading.value = false
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
    videos, // 用户视频
    publicVideos, // 公开视频
    total,
    publicTotal,
    currentPage,
    publicCurrentPage,
    isLoading,
    message,
    uploadVideo,
    fetchVideos,
    fetchPublicVideos,
    updateVideo,
    deleteVideo,
    batchUpdateVideos
  }
}) 