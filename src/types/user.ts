export interface User {
  id: string
  username: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface LoginResponse {
  user: User
  token: string
}

export interface RegisterParams {
  username: string
  password: string
  email: string
}

export interface LoginParams {
  username: string
  password: string
}

// 用户个人资料接口
export interface UserProfile {
  userId: string
  username: string
  nickname: string
  avatar: string
  bio: string
  stats: {
    videos: number
    followers: number
    following: number
  }
  createdAt: string
}

// 用户观看历史项
export interface WatchHistoryItem {
  id: string
  videoId: string
  title: string
  coverUrl: string
  duration: number
  watchedDuration: number
  progress: number
  watchedAt: string
}

// 观看历史列表
export interface WatchHistoryList {
  total: number
  page: number
  pageSize: number
  items: WatchHistoryItem[]
}

// 收藏视频项
export interface FavoriteItem {
  id: string
  videoId: string
  title: string
  coverUrl: string
  duration: number
  createdAt: string
  status: string
}

// 收藏列表
export interface FavoriteList {
  total: number
  page: number
  pageSize: number
  items: FavoriteItem[]
} 