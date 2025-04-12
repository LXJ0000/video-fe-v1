import { defineStore } from 'pinia'
import { ref } from 'vue'
import { videoApi, type Mark, type UpdateMarkParams, type UpdateAnnotationParams } from '@/api/video'
import { message } from '@/utils/message'
import { useUserStore } from '@/stores/user'

export const useMarksStore = defineStore('marks', () => {
  const userStore = useUserStore()
  const currentVideoId = ref<string>('')
  const marks = ref<Mark[]>([])

  const fetchMarks = async (videoId: string) => {
    try {
      if (!userStore.isAuthenticated) {
        throw new Error('用户未登录')
      }
      currentVideoId.value = videoId
      const { data } = await videoApi.getMarks(videoId)
      if (data.code === 0) {
        if (data.data !== null) {
          marks.value = data.data.map((mark: Mark) => ({
            ...mark,
            annotations: mark.annotations || [], // 确保 annotations 始终是数组
            // 如果时间是默认值，使用当前时间
          createdAt: mark.createdAt === "0001-01-01T00:00:00Z" ? new Date().toISOString() : mark.createdAt,
          updatedAt: mark.updatedAt === "0001-01-01T00:00:00Z" ? new Date().toISOString() : mark.updatedAt
          })) 
        } else {
          marks.value = []
        }
      } else {
        message.error(data.msg || '获取标记失败1')
      }
    } catch (error) {
      message.error('获取标记失败2')
      console.error('Failed to fetch marks:', error)
      throw error
    }
  }

  const addMark = async (markData: {
    videoId: string
    timestamp: number
    content: string
  }) => {
    try {
      if (!marks.value) {
        marks.value = [] // 确保 marks 是数组
      }
      const { data } = await videoApi.addMark(markData)
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

  const updateMark = async (markId: string, data: UpdateMarkParams) => {
    try {
      const response = await videoApi.updateMark(markId, data)
      if (response.data.code === 0) {
        const index = marks.value.findIndex(m => m.id === markId)
        if (index !== -1) {
          // 确保返回数据完整，如果不完整则合并现有数据
          const updatedMark = response.data.data || {}
          marks.value[index] = {
            ...marks.value[index],  // 保留原有数据
            ...updatedMark,         // 覆盖更新的数据
            content: data.content,  // 确保内容更新
            timestamp: data.timestamp // 确保时间戳更新
          }
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
      const response = await videoApi.addAnnotation(markId, { content })
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
      const response = await videoApi.updateAnnotation(annotationId, { content })
      if (response.data.code === 0) {
        const mark = marks.value.find(m => m.id === markId)
        if (mark && mark.annotations) {
          const index = mark.annotations.findIndex(a => a.id === annotationId)
          if (index !== -1) {
            // 确保返回数据完整，如果不完整则合并现有数据
            const updatedAnnotation = response.data.data || {}
            mark.annotations[index] = {
              ...mark.annotations[index],  // 保留原有数据
              ...updatedAnnotation,        // 覆盖更新的数据
              content: content             // 确保内容更新
            }
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
      const response = await videoApi.deleteAnnotation(annotationId)
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
      const response = await videoApi.deleteMark(markId)
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