import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userApi } from '../api/user'
import type { User, LoginParams, RegisterParams } from '../types/user'
import { message } from '../utils/message'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isAuthenticated = ref(false)

  // 从 localStorage 恢复状态
  const initializeFromStorage = () => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    if (storedUser && storedToken) {
      currentUser.value = JSON.parse(storedUser)
      token.value = storedToken
      isAuthenticated.value = true
    }
  }

  // 登录
  const login = async (params: LoginParams) => {
    try {
      const { data } = await userApi.login(params)
      if (data.code === 0) {
        currentUser.value = data.data.user
        token.value = data.data.token
        isAuthenticated.value = true
        
        // 保存到 localStorage
        localStorage.setItem('user', JSON.stringify(data.data.user))
        localStorage.setItem('token', data.data.token)
        
        // message.success('登录成功')
        return true
      } else {
        message.error(data.msg || '登录失败')
        return false
      }
    } catch (error) {
      message.error('登录失败，请稍后重试')
      return false
    }
  }

  // 注册
  const register = async (params: RegisterParams) => {
    try {
      const { data } = await userApi.register(params)
      if (data.code === 0) {
        message.success('注册成功')
        return true
      } else {
        message.error(data.msg || '注册失败')
        return false
      }
    } catch (error) {
      message.error('注册失败，请稍后重试')
      return false
    }
  }

  // 登出
  const logout = () => {
    currentUser.value = null
    token.value = null
    isAuthenticated.value = false
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    message.success('已退出登录')
  }

  return {
    currentUser,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    initializeFromStorage
  }
}) 