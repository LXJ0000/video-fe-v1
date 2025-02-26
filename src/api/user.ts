import axios from 'axios'
import { API_BASE_URL } from './config'
import type { RegisterParams, LoginParams, LoginResponse } from '../types/user'
import type { ApiResponse } from './config'

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

export const userApi = {
  // 用户注册
  register(params: RegisterParams) {
    return apiClient.post<ApiResponse>('/users/register', params)
  },

  // 用户登录
  login(params: LoginParams) {
    return apiClient.post<ApiResponse<LoginResponse>>('/users/login', params)
  }
} 