// 视频状态类型
export type VideoStatus = 'ready' | 'private' | 'draft'

// 视频状态筛选类型（包含空字符串表示全部）
export type VideoStatusFilter = '' | VideoStatus

// 排序字段类型
export type SortField = 'created_at' | 'views' | 'likes' | 'file_size'

// 排序方向类型
export type SortOrder = 'asc' | 'desc'

// 视频列表请求参数类型
export interface VideoListParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: VideoStatusFilter
  startDate?: string
  endDate?: string
  tags?: string[]
  sortBy?: SortField
  sortOrder?: SortOrder
}

// 视频统计信息类型
export interface VideoStats {
  views: number
  likes: number
  comments: number
  shares: number
}

// 视频项类型
export interface VideoItem {
  id: string
  title: string
  description: string
  fileSize: number
  format: string
  status: VideoStatus
  coverUrl?: string
  thumbnailUrl?: string
  tags?: string[]
  stats?: VideoStats
  createdAt: string
  duration: number  // 视频时长（秒）
}

// 视频列表响应类型
export interface VideoListResponse {
  total: number
  items: VideoItem[]
}

export interface BatchOperationResponse {
  successCount: number
  failedCount: number
  failedIds: string[]
}

// 更新视频参数类型
interface UpdateVideoParams {
  title?: string
  description?: string
  status?: VideoStatus
  tags?: string[]
  duration?: number  // 添加时长字段
} 