import axios from 'axios'
import { API_BASE_URL, ApiResponse, publicApiClient } from './config'
import type { RegisterParams, LoginParams, LoginResponse } from '../types/user'

export const userApi = {
  // 用户注册
  register(params: RegisterParams) {
    return publicApiClient.post<ApiResponse>('/users/register', params)
  },

  // 用户登录
  login(params: LoginParams) {
    return publicApiClient.post<ApiResponse<LoginResponse>>('/users/login', params)
  }
} 