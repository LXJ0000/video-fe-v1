import { defineStore } from 'pinia'
import { ref } from 'vue'
import { videoApi, type Mark } from '@/api/video'
import { message } from '@/utils/message'

export const useMarksStore = defineStore('marks', () => {
  const marks = ref<Mark[]>([])

  const fetchMarks = async (userId: string, videoId: string) => {
    try {
      const response = await videoApi.getMarks(userId, videoId)
      marks.value = response.data
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
      const response = await videoApi.addMark(markData.userId, markData.videoId, markData)
      marks.value.push(response.data)
      message.success('添加标记成功')
    } catch (error) {
      message.error('添加标记失败')
      console.error('Failed to add mark:', error)
    }
  }

  const addAnnotation = async (markId: string, content: string) => {
    try {
      const response = await videoApi.addAnnotation(markId, { content })
      const mark = marks.value.find(m => m.id === markId)
      if (mark) {
        if (!mark.annotations) mark.annotations = []
        mark.annotations.push(response.data)
      }
      message.success('添加注释成功')
    } catch (error) {
      message.error('添加注释失败')
      console.error('Failed to add annotation:', error)
    }
  }

  const deleteAnnotation = async (markId: string, annotationId: string) => {
    try {
      await videoApi.deleteAnnotation(markId, annotationId)
      const mark = marks.value.find(m => m.id === markId)
      if (mark && mark.annotations) {
        mark.annotations = mark.annotations.filter(a => a.id !== annotationId)
      }
      message.success('删除注释成功')
    } catch (error) {
      message.error('删除注释失败')
      console.error('Failed to delete annotation:', error)
    }
  }

  const deleteMark = async (markId: string) => {
    try {
      await videoApi.deleteMark(markId)
      marks.value = marks.value.filter(m => m.id !== markId)
      message.success('删除标记成功')
    } catch (error) {
      message.error('删除标记失败')
      console.error('Failed to delete mark:', error)
    }
  }

  return {
    marks,
    fetchMarks,
    addMark,
    addAnnotation,
    deleteAnnotation,
    deleteMark
  }
}) 