import { API_BASE_URL, API_ENDPOINTS, ApiResponse, privateApiClient, publicApiClient } from './config'
import type { VideoStatus, VideoListParams, VideoItem } from '../types/video'

// 视频相关 API
export const videoApi = {
  // 获取视频列表 (需要认证)
  getVideos(params: {
    page?: number
    pageSize?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    keyword?: string
  }) {
    return privateApiClient.get(API_ENDPOINTS.VIDEOS, { params })
  },

  // 上传视频 (需要认证)
  uploadVideo(formData: FormData, onUploadProgress?: (progressEvent: any) => void) {
    return privateApiClient.post(API_ENDPOINTS.VIDEOS, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    })
  },

  // 获取视频详情 (公开)
  getVideoDetail(id: string) {
    return privateApiClient.get(API_ENDPOINTS.VIDEO_DETAIL(id))
  },

  // 获取视频流地址
  getVideoStreamUrl(id: string) {
    // 获取 token
    const token = localStorage.getItem('token')
    
    // 使用 URL 对象处理参数
    const url = new URL(`${API_BASE_URL}${API_ENDPOINTS.VIDEO_STREAM(id)}`)
    url.searchParams.set('t', Date.now().toString())
    // 添加 token 到 URL
    if (token) {
      url.searchParams.set('token', token)
    }
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
    return privateApiClient.put(API_ENDPOINTS.VIDEO_UPDATE(id), data)
  },

  // 删除视频
  deleteVideo(id: string) {
    return privateApiClient.delete(API_ENDPOINTS.VIDEO_DELETE(id))
  },

  // 批量操作
  batchOperation(data: {
    ids: string[]
    action: 'delete' | 'update_status'
    status?: string
  }) {
    return privateApiClient.post(API_ENDPOINTS.VIDEO_BATCH, data)
  },

  // 标记相关
  getMarks(videoId: string) {
    return privateApiClient.get(API_ENDPOINTS.MARKS, { 
      params: { videoId } 
    })
  },

  addMark(data: {
    videoId: string
    timestamp: number
    content: string
  }) {
    return privateApiClient.post(API_ENDPOINTS.MARKS, data)
  },

  updateMark(markId: string, data: {
    content: string
  }) {
    return privateApiClient.put(API_ENDPOINTS.MARK_UPDATE(markId), data)
  },

  deleteMark(markId: string) {
    return privateApiClient.delete(API_ENDPOINTS.MARK_DELETE(markId))
  },

  // 注释相关
  getAnnotations(markId: string) {
    return privateApiClient.get(API_ENDPOINTS.MARK_ANNOTATIONS(markId))
  },

  addAnnotation(markId: string, data: {
    content: string
  }) {
    return privateApiClient.post(API_ENDPOINTS.MARK_ANNOTATIONS(markId), data)
  },

  updateAnnotation(annotationId: string, data: {
    content: string
  }) {
    return privateApiClient.put(API_ENDPOINTS.MARK_ANNOTATION_UPDATE(annotationId), data)
  },

  deleteAnnotation(annotationId: string) {
    return privateApiClient.delete(API_ENDPOINTS.MARK_ANNOTATION_DELETE(annotationId))
  },

  // 笔记相关
  getNotes(videoId: string) {
    return privateApiClient.get(API_ENDPOINTS.NOTES, { 
      params: { videoId } 
    })
  },

  addNote(data: {
    videoId: string
    timestamp: number
    content: string
  }) {
    return privateApiClient.post(API_ENDPOINTS.NOTES, data)
  },

  updateNote(noteId: string, data: {
    content: string
  }) {
    return privateApiClient.put(API_ENDPOINTS.NOTE_UPDATE(noteId), data)
  },

  deleteNote(noteId: string) {
    return privateApiClient.delete(API_ENDPOINTS.NOTE_DELETE(noteId))
  },

  // 导出功能
  exportData(videoId: string) {
    return privateApiClient.get(API_ENDPOINTS.EXPORT, {
      params: { videoId }
    })
  },

  // 获取公开视频列表 (公开)
  getPublicVideos(params: {
    page?: number
    pageSize?: number
    userId?: string
    sort?: string
    keyword?: string
  }) {
    return publicApiClient.get<ApiResponse<{
      total: number
      page: number
      pageSize: number
      items: VideoItem[]
    }>>(API_ENDPOINTS.VIDEOS_PUBLIC, { params })
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