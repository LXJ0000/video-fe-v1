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

  // 标记相关
  getMarks(userId: string, videoId: string) {
    return apiClient.get(API_ENDPOINTS.MARKS(userId, videoId))
  },

  addMark(userId: string, videoId: string, markData: {
    timestamp: number
    content: string
  }) {
    return apiClient.post(API_ENDPOINTS.MARKS(userId, videoId), {
      videoId,
      ...markData
    })
  },

  updateMark(userId: string, videoId: string, markId: string, data: {
    content: string
    timestamp: number
  }) {
    return apiClient.put(API_ENDPOINTS.MARK_UPDATE(userId, videoId, markId), data)
  },

  deleteMark(userId: string, videoId: string, markId: string) {
    return apiClient.delete(API_ENDPOINTS.MARK_DELETE(userId, videoId, markId))
  },

  // 注释相关
  getAnnotations(userId: string, videoId: string, markId: string) {
    return apiClient.get(API_ENDPOINTS.MARK_ANNOTATIONS(userId, videoId, markId))
  },

  addAnnotation(userId: string, videoId: string, markId: string, data: {
    content: string
  }) {
    return apiClient.post(API_ENDPOINTS.MARK_ANNOTATIONS(userId, videoId, markId), data)
  },

  updateAnnotation(userId: string, videoId: string, annotationId: string, data: {
    content: string
  }) {
    return apiClient.put(API_ENDPOINTS.MARK_ANNOTATION_UPDATE(userId, videoId, annotationId), data)
  },

  deleteAnnotation(userId: string, videoId: string, annotationId: string) {
    return apiClient.delete(API_ENDPOINTS.MARK_ANNOTATION_DELETE(userId, videoId, annotationId))
  },

  // 笔记相关
  getNotes(userId: string, videoId: string) {
    return apiClient.get(API_ENDPOINTS.NOTES(userId, videoId))
  },

  addNote(userId: string, videoId: string, noteData: {
    timestamp: number
    content: string
  }) {
    return apiClient.post(API_ENDPOINTS.NOTES(userId, videoId), {
      videoId,
      ...noteData
    })
  },

  updateNote(userId: string, videoId: string, noteId: string, data: {
    content: string
    timestamp: number
  }) {
    return apiClient.put(API_ENDPOINTS.NOTE_UPDATE(userId, videoId, noteId), data)
  },

  deleteNote(userId: string, videoId: string, noteId: string) {
    return apiClient.delete(API_ENDPOINTS.NOTE_DELETE(userId, videoId, noteId))
  },

  // 导出功能
  exportData(userId: string, videoId: string) {
    return apiClient.get<ExportData>(API_ENDPOINTS.EXPORT(userId, videoId))
  }
}

// 在文件顶部添加接口导出
export interface Mark {
  id: string
  userId: string
  videoId: string
  timestamp: number
  content: string
  annotations: Annotation[] | null
  createdAt: string
  updatedAt: string // 添加 updatedAt 字段
}

export interface Annotation {
  id: string
  userId: string
  markId: string
  content: string
  createdAt: string
}

export interface Note {
  id: string
  userId: string
  videoId: string
  timestamp: number
  content: string
  createdAt: string
}

export interface ExportData {
  marks: Mark[]
  annotations: Annotation[]
  notes: Note[]
}

// 更新请求参数的接口定义
export interface UpdateMarkParams {
  content: string
  timestamp: number
  id?: string
  userId?: string
  videoId?: string
}

export interface UpdateAnnotationParams {
  content: string
  id?: string
  userId?: string
  markId?: string
}

export interface UpdateNoteParams {
  content: string
  timestamp: number
  id?: string
  userId?: string
  videoId?: string
} 