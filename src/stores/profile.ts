import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userApi } from '@/api/user'
import type { UserProfile, WatchHistoryList, FavoriteList } from '@/types/user'
import { message } from '@/utils/message'

export const useProfileStore = defineStore('profile', () => {
  // 用户个人资料状态
  const userProfile = ref<UserProfile | null>(null)
  const isLoadingProfile = ref(false)
  const profileError = ref('')

  // 观看历史状态
  const watchHistory = ref<WatchHistoryList | null>(null)
  const isLoadingHistory = ref(false)
  const historyError = ref('')
  const historyCurrentPage = ref(1)
  const historyHasMore = ref(false)

  // 收藏视频状态
  const favorites = ref<FavoriteList | null>(null)
  const isLoadingFavorites = ref(false)
  const favoritesError = ref('')
  const favoritesCurrentPage = ref(1)
  const favoritesHasMore = ref(false)

  // 获取用户个人资料
  const fetchUserProfile = async (userId: string) => {
    try {
      isLoadingProfile.value = true
      profileError.value = ''
      
      const { data } = await userApi.getUserProfile(userId)
      
      if (data.code === 0) {
        userProfile.value = data.data
      } else {
        profileError.value = data.msg || '获取用户资料失败'
      }
    } catch (error) {
      profileError.value = '获取用户资料失败，请稍后重试'
      console.error('获取用户资料失败:', error)
    } finally {
      isLoadingProfile.value = false
    }
  }

  // 更新用户个人资料
  const updateUserProfile = async (
    userId: string, 
    profileData: { nickname?: string; avatar?: string; bio?: string }
  ) => {
    try {
      const { data } = await userApi.updateUserProfile(userId, profileData)
      
      if (data.code === 0) {
        // 更新本地状态
        if (userProfile.value) {
          userProfile.value = {
            ...userProfile.value,
            ...profileData
          }
        }
        message.success('个人资料更新成功')
        return true
      } else {
        message.error(data.msg || '更新个人资料失败')
        return false
      }
    } catch (error) {
      message.error('更新个人资料失败，请稍后重试')
      console.error('更新个人资料失败:', error)
      return false
    }
  }

  // 获取观看历史
  const fetchWatchHistory = async (userId: string, page = 1, reset = false) => {
    try {
      isLoadingHistory.value = true
      historyError.value = ''
      
      const { data } = await userApi.getWatchHistory(userId, page)
      
      if (data?.code === 0 && data?.data) {
        // 确保data.data.items是数组
        const items = Array.isArray(data.data.items) ? data.data.items : [];
        
        if (reset || page === 1) {
          watchHistory.value = {
            ...data.data,
            items: items,
            total: data.data.total || 0,
            page: data.data.page || page,
            pageSize: data.data.pageSize || 10
          }
        } else if (watchHistory.value) {
          // 追加新数据
          watchHistory.value = {
            ...data.data,
            items: [...(watchHistory.value.items || []), ...items],
            total: data.data.total || watchHistory.value.total || 0,
            page: data.data.page || page,
            pageSize: data.data.pageSize || watchHistory.value.pageSize || 10
          }
        } else {
          watchHistory.value = {
            ...data.data,
            items: items,
            total: data.data.total || 0,
            page: data.data.page || page,
            pageSize: data.data.pageSize || 10
          }
        }
        
        historyCurrentPage.value = page
        historyHasMore.value = items.length >= (data.data.pageSize || 10)
      } else {
        // 请求成功但返回错误码或没有数据时的兜底处理
        if (page === 1 || reset) {
          // 初始化空的历史记录
          watchHistory.value = {
            items: [],
            total: 0,
            page: page,
            pageSize: 10
          }
        }
        historyError.value = data?.msg || '获取观看历史失败'
        console.warn('获取观看历史返回异常数据:', data)
      }
    } catch (error) {
      // 请求失败的兜底处理
      if (page === 1 || reset) {
        watchHistory.value = {
          items: [],
          total: 0,
          page: page,
          pageSize: 10
        }
      }
      historyError.value = '获取观看历史失败，请稍后重试'
      console.error('获取观看历史失败:', error)
    } finally {
      isLoadingHistory.value = false
    }
  }

  // 获取收藏列表
  const fetchFavorites = async (userId: string, page = 1, reset = false) => {
    try {
      isLoadingFavorites.value = true
      favoritesError.value = ''
      
      const { data } = await userApi.getFavorites(userId, page)
      
      if (data?.code === 0 && data?.data) {
        // 确保data.data.items是数组
        const items = Array.isArray(data.data.items) ? data.data.items : [];
        
        if (reset || page === 1) {
          favorites.value = {
            ...data.data,
            items: items,
            total: data.data.total || 0,
            page: data.data.page || page,
            pageSize: data.data.pageSize || 10
          }
        } else if (favorites.value) {
          // 追加新数据
          favorites.value = {
            ...data.data,
            items: [...(favorites.value.items || []), ...items],
            total: data.data.total || favorites.value.total || 0,
            page: data.data.page || page,
            pageSize: data.data.pageSize || favorites.value.pageSize || 10
          }
        } else {
          favorites.value = {
            ...data.data,
            items: items,
            total: data.data.total || 0,
            page: data.data.page || page,
            pageSize: data.data.pageSize || 10
          }
        }
        
        favoritesCurrentPage.value = page
        favoritesHasMore.value = items.length >= (data.data.pageSize || 10)
      } else {
        // 请求成功但返回错误码或没有数据时的兜底处理
        if (page === 1 || reset) {
          // 初始化空的收藏列表
          favorites.value = {
            items: [],
            total: 0,
            page: page,
            pageSize: 10
          }
        }
        favoritesError.value = data?.msg || '获取收藏列表失败'
        console.warn('获取收藏列表返回异常数据:', data)
      }
    } catch (error) {
      // 请求失败的兜底处理
      if (page === 1 || reset) {
        favorites.value = {
          items: [],
          total: 0,
          page: page,
          pageSize: 10
        }
      }
      favoritesError.value = '获取收藏列表失败，请稍后重试'
      console.error('获取收藏列表失败:', error)
    } finally {
      isLoadingFavorites.value = false
    }
  }

  // 添加到收藏
  const addToFavorite = async (videoId: string) => {
    try {
      const { data } = await userApi.addToFavorite(videoId)
      
      if (data.code === 0) {
        message.success('添加到收藏成功')
        return true
      } else {
        message.error(data.msg || '添加到收藏失败')
        return false
      }
    } catch (error) {
      message.error('添加到收藏失败，请稍后重试')
      console.error('添加到收藏失败:', error)
      return false
    }
  }

  // 移除收藏
  const removeFromFavorite = async (videoId: string) => {
    try {
      const { data } = await userApi.removeFromFavorite(videoId)
      
      if (data?.code === 0) {
        // 从本地状态中移除
        if (favorites.value && Array.isArray(favorites.value.items)) {
          favorites.value.items = favorites.value.items.filter(item => item?.videoId !== videoId)
          if (favorites.value.total > 0) {
            favorites.value.total -= 1
          }
        }
        message.success('移除收藏成功')
        return true
      } else {
        message.error(data?.msg || '移除收藏失败')
        return false
      }
    } catch (error) {
      message.error('移除收藏失败，请稍后重试')
      console.error('移除收藏失败:', error)
      return false
    }
  }

  // 清空状态
  const resetState = () => {
    userProfile.value = null
    watchHistory.value = null
    favorites.value = null
    profileError.value = ''
    historyError.value = ''
    favoritesError.value = ''
    historyCurrentPage.value = 1
    favoritesCurrentPage.value = 1
    historyHasMore.value = false
    favoritesHasMore.value = false
  }

  return {
    // 状态
    userProfile,
    isLoadingProfile,
    profileError,
    watchHistory,
    isLoadingHistory,
    historyError,
    historyCurrentPage,
    historyHasMore,
    favorites,
    isLoadingFavorites,
    favoritesError,
    favoritesCurrentPage,
    favoritesHasMore,
    
    // 方法
    fetchUserProfile,
    updateUserProfile,
    fetchWatchHistory,
    fetchFavorites,
    addToFavorite,
    removeFromFavorite,
    resetState
  }
}) 