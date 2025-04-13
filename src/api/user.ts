import axios from 'axios'
import { API_BASE_URL, ApiResponse, publicApiClient, privateApiClient } from './config'
import type { RegisterParams, LoginParams, LoginResponse } from '@/types/user'

export const userApi = {
  // 用户注册
  register(params: RegisterParams) {
    return publicApiClient.post<ApiResponse>('/users/register', params)
  },

  // 用户登录
  login(params: LoginParams) {
    return publicApiClient.post<ApiResponse<LoginResponse>>('/users/login', params)
  },

  // 获取用户个人资料
  getUserProfile(userId: string) {
    return privateApiClient.get<ApiResponse>(`/users/${userId}/profile`)
  },

  // 更新用户个人资料
  updateUserProfile(userId: string, data: {
    nickname?: string,
    avatar?: string,
    bio?: string
  }) {
    return privateApiClient.put<ApiResponse>(`/users/${userId}/profile`, data)
  },

  // 获取用户观看历史
  getWatchHistory(userId: string, page = 1, pageSize = 20) {
    return privateApiClient.get<ApiResponse>(`/users/${userId}/watch-history`, {
      params: { page, pageSize }
    })
  },

  // 获取用户收藏列表
  getFavorites(userId: string, page = 1, pageSize = 20) {
    return privateApiClient.get<ApiResponse>(`/users/${userId}/favorites`, {
      params: { page, pageSize }
    })
  },

  // 添加视频到收藏
  addToFavorite(videoId: string) {
    return privateApiClient.post<ApiResponse>(`/videos/${videoId}/favorite`)
  },

  // 从收藏中移除视频
  removeFromFavorite(videoId: string) {
    return privateApiClient.delete<ApiResponse>(`/videos/${videoId}/favorite`)
  },

  // 记录视频观看历史
  recordWatch(videoId: string, data: {
    duration: number,
    progress: number
  }) {
    return privateApiClient.post<ApiResponse>(`/videos/${videoId}/watch`, data)
  }
} 