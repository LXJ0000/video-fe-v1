// API 基础配置
export const API_BASE_URL = 'https://ajkosjntzbkc.sealosgzg.site/api/v1'
export const ASSETS_BASE_URL = 'https://ajkosjntzbkc.sealosgzg.site' // 用于静态资源

// API 端点
export const API_ENDPOINTS = {
  VIDEOS: '/videos',
  VIDEO_STREAM: (id: string) => `/videos/${id}/stream`,
  VIDEO_DETAIL: (id: string) => `/videos/${id}`,
  VIDEO_UPDATE: (id: string) => `/videos/${id}`,
  VIDEO_DELETE: (id: string) => `/videos/${id}`,
  VIDEO_BATCH: '/videos/batch',
  VIDEO_STATS: (id: string) => `/videos/${id}/stats`,
} as const

// API 配置
export const API_CONFIG = {
  TIMEOUT: 30000, // 30秒
  MAX_FILE_SIZE: 1024 * 1024 * 1024, // 1GB
  MAX_THUMBNAIL_SIZE: 2 * 1024 * 1024, // 2MB
  ALLOWED_VIDEO_TYPES: [
    'video/mp4',
    'video/quicktime', // .mov
    'video/x-msvideo', // .avi
    'video/x-ms-wmv',  // .wmv
    'video/x-flv',     // .flv
    'video/x-matroska' // .mkv
  ],
  ALLOWED_IMAGE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif'
  ] as const,
  VIDEO_STATUS: {
    READY: 'ready',
    PRIVATE: 'private',
    DRAFT: 'draft'
  }
} as const

// 修改图片类型定义
export type AllowedImageType = typeof API_CONFIG.ALLOWED_IMAGE_TYPES[number]

// 响应类型
export interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
} 