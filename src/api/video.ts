import axios from 'axios'
import { API_BASE_URL, API_ENDPOINTS } from './config'
import type { VideoStatus, VideoListParams } from '../types/video'

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  // 移除自定义请求头，使用默认配置
  // headers: {
  //   'Cache-Control': 'no-cache',
  //   'Pragma': 'no-cache',
  //   'Expires': '0',
  // }
})

// 添加请求拦截器处理错误
apiClient.interceptors.request.use(
  config => config,
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 添加响应拦截器统一处理错误
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // 服务器返回错误状态码
      console.error('Response error:', error.response.data)
    } else if (error.request) {
      // 请求发出但没有收到响应
      console.error('No response received:', error.request)
    } else {
      // 请求配置出错
      console.error('Request config error:', error.message)
    }
    return Promise.reject(error)
  }
)

// 视频相关 API
export const videoApi = {
  // 获取视频列表
  getVideos(params: {
    page?: number
    pageSize?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    keyword?: string
  }) {
    return apiClient.get(API_ENDPOINTS.VIDEOS, { params })
  },

  // 上传视频
  uploadVideo(formData: FormData, onUploadProgress?: (progressEvent: any) => void) {
    // 确保 FormData 中包含 duration 字段
    return apiClient.post(API_ENDPOINTS.VIDEOS, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    })
  },

  // 获取视频详情
  getVideoDetail(id: string) {
    return apiClient.get(API_ENDPOINTS.VIDEO_DETAIL(id))
  },

  // 获取视频流地址
  getVideoStreamUrl(id: string) {
    // 使用 URL 对象处理参数
    const url = new URL(`${API_BASE_URL}${API_ENDPOINTS.VIDEO_STREAM(id)}`)
    url.searchParams.set('t', Date.now().toString())
    return url.toString()
  },

  // 更新视频
  updateVideo(id: string, data: {
    title?: string
    description?: string
    status?: VideoStatus
    tags?: string[]
    duration?: number  // 添加时长字段
  }) {
    return apiClient.put(API_ENDPOINTS.VIDEO_UPDATE(id), data)
  },

  // 删除视频
  deleteVideo(id: string) {
    return apiClient.delete(API_ENDPOINTS.VIDEO_DELETE(id))
  },

  // 批量操作
  batchOperation(data: {
    ids: string[]
    action: 'delete' | 'update_status'
    status?: string
  }) {
    return apiClient.post(API_ENDPOINTS.VIDEO_BATCH, data)
  },
} 