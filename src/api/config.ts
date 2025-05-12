import axios from "axios";

// API 基础配置
export const API_BASE_URL = "https://jpsdepeduffc.sealosgzg.site/api/v1";
export const ASSETS_BASE_URL = "https://jpsdepeduffc.sealosgzg.site"; // 用于静态资源

// API 端点
export const API_ENDPOINTS = {
  VIDEOS: "/videos",
  VIDEO_STREAM: (id: string) => `/videos/${id}/stream`,
  VIDEO_DETAIL: (id: string) => `/videos/${id}`,
  VIDEO_UPDATE: (id: string) => `/videos/${id}`,
  VIDEO_DELETE: (id: string) => `/videos/${id}`,
  VIDEO_BATCH: "/videos/batch",
  VIDEO_STATS: (id: string) => `/videos/${id}/stats`,
  MARKS: '/marks',
  MARK_UPDATE: (markId: string) => `/marks/${markId}`,
  MARK_DELETE: (markId: string) => `/marks/${markId}`,
  MARK_ANNOTATIONS: (markId: string) => `/marks/${markId}/annotations`,
  MARK_ANNOTATION_UPDATE: (annotationId: string) => `/marks/annotations/${annotationId}`,
  MARK_ANNOTATION_DELETE: (annotationId: string) => `/marks/annotations/${annotationId}`,
  NOTES: '/notes',
  NOTE_UPDATE: (noteId: string) => `/notes/${noteId}`,
  NOTE_DELETE: (noteId: string) => `/notes/${noteId}`,
  EXPORT: '/videos/export',
  VIDEOS_PUBLIC: "/videos/public", // 添加公开视频列表端点
} as const;

// API 配置
export const API_CONFIG = {
  TIMEOUT: 3000000, // 300秒
  MAX_FILE_SIZE: 5 * 1024 * 1024 * 1024, // 1GB
  MAX_THUMBNAIL_SIZE: 2 * 1024 * 1024, // 2MB
  ALLOWED_VIDEO_TYPES: [
    "video/mp4",
    "video/quicktime", // .mov
    "video/x-msvideo", // .avi
    "video/x-ms-wmv", // .wmv
    "video/x-flv", // .flv
    "video/x-matroska", // .mkv
  ],
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif"] as const,
  VIDEO_STATUS: {
    PUBLIC: "public",
    PRIVATE: "private",
    DRAFT: "draft",
  },
} as const;

// 修改图片类型定义
export type AllowedImageType = (typeof API_CONFIG.ALLOWED_IMAGE_TYPES)[number];

// 响应类型
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

// 创建两个 axios 实例
export const createApiClient = (useAuth = false) => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 10秒
  });

  if (useAuth) {
    // 添加认证请求拦截器
    client.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  return client;
};

// 导出两个实例
export const publicApiClient = createApiClient(false); // 不需要认证的接口
export const privateApiClient = createApiClient(true); // 需要认证的接口
