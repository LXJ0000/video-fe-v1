import { defineStore } from 'pinia'
import { ref } from 'vue'
import { videoApi, type Mark, type UpdateMarkParams, type UpdateAnnotationParams } from '@/api/video'
import { message } from '@/utils/message'

export const useMarksStore = defineStore('marks', () => {
  const marks = ref<Mark[]>([])
  const currentVideoId = ref<string>('')
  const currentUserId = ref('test_user_id') // 后续从用户状态获取

  const fetchMarks = async (userId: string, videoId: string) => {
    try {
      currentVideoId.value = videoId
      currentUserId.value = userId
      const { data } = await videoApi.getMarks(userId, videoId)
      if (data.code === 0) {
        marks.value = data.data
      } else {
        message.error(data.msg || '获取标记失败')
      }
    } catch (error) {
      message.error('获取标记失败')
      console.error('Failed to fetch marks:', error)
    }
  }

  const addMark = async (markData: {
    videoId: string
    userId: string
    timestamp: number
    content: string
  }) => {
    try {
      if (!marks.value) {
        marks.value = [] // 确保 marks 是数组
      }
      const { data } = await videoApi.addMark(markData.userId, markData.videoId, markData)
      if (data.code === 0) {
        marks.value.push(data.data)
        message.success('添加标记成功')
      } else {
        message.error(data.msg || '添加标记失败')
      }
    } catch (error) {
      message.error('添加标记失败')
      console.error('Failed to add mark:', error)
    }
  }

  const updateMark = async (markId: string, data: {
    content: string
    timestamp: number
  }) => {
    try {
      const updateData: UpdateMarkParams = {
        ...data,
        id: markId,
        userId: currentUserId.value,
        videoId: currentVideoId.value
      }
      const response = await videoApi.updateMark(currentUserId.value, currentVideoId.value, markId, updateData)
      if (response.data.code === 0) {
        const index = marks.value.findIndex(m => m.id === markId)
        if (index !== -1) {
          marks.value[index] = response.data.data
        }
        message.success('更新标记成功')
      } else {
        message.error(response.data.msg || '更新标记失败')
      }
    } catch (error) {
      message.error('更新标记失败')
      console.error('Failed to update mark:', error)
    }
  }

  const addAnnotation = async (markId: string, content: string) => {
    try {
      const response = await videoApi.addAnnotation(currentUserId.value, currentVideoId.value, markId, { content })
      if (response.data.code === 0) {
        const mark = marks.value.find(m => m.id === markId)
        if (mark) {
          if (!mark.annotations) mark.annotations = []
          mark.annotations.push(response.data.data)
        }
        message.success('添加注释成功')
      } else {
        message.error(response.data.msg || '添加注释失败')
      }
    } catch (error) {
      message.error('添加注释失败')
      console.error('Failed to add annotation:', error)
    }
  }

  const updateAnnotation = async (markId: string, annotationId: string, content: string) => {
    try {
      const updateData: UpdateAnnotationParams = {
        content,
        id: annotationId,
        userId: currentUserId.value,
        markId: markId
      }
      const response = await videoApi.updateAnnotation(currentUserId.value, currentVideoId.value, annotationId, updateData)
      if (response.data.code === 0) {
        const mark = marks.value.find(m => m.id === markId)
        if (mark && mark.annotations) {
          const index = mark.annotations.findIndex(a => a.id === annotationId)
          if (index !== -1) {
            mark.annotations[index] = response.data.data
          }
        }
        message.success('更新注释成功')
      } else {
        message.error(response.data.msg || '更新注释失败')
      }
    } catch (error) {
      message.error('更新注释失败')
      console.error('Failed to update annotation:', error)
    }
  }

  const deleteAnnotation = async (markId: string, annotationId: string) => {
    try {
      const response = await videoApi.deleteAnnotation(currentUserId.value, currentVideoId.value, annotationId)
      if (response.data.code === 0) {
        const mark = marks.value.find(m => m.id === markId)
        if (mark && mark.annotations) {
          mark.annotations = mark.annotations.filter(a => a.id !== annotationId)
        }
        message.success('删除注释成功')
      } else {
        message.error(response.data.msg || '删除注释失败')
      }
    } catch (error) {
      message.error('删除注释失败')
      console.error('Failed to delete annotation:', error)
    }
  }

  const deleteMark = async (markId: string) => {
    try {
      const response = await videoApi.deleteMark(currentUserId.value, currentVideoId.value, markId)
      if (response.data.code === 0) {
        marks.value = marks.value.filter(m => m.id !== markId)
        message.success('删除标记成功')
      } else {
        message.error(response.data.msg || '删除标记失败')
      }
    } catch (error) {
      message.error('删除标记失败')
      console.error('Failed to delete mark:', error)
    }
  }

  return {
    marks,
    fetchMarks,
    addMark,
    updateMark,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    deleteMark
  }
}) 