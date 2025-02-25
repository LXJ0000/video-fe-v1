import { defineStore } from 'pinia'
import { ref } from 'vue'
import { videoApi, type Note } from '@/api/video'
import { message } from '@/utils/message'

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])

  const fetchNotes = async (userId: string, videoId: string) => {
    try {
      const response = await videoApi.getNotes(userId, videoId)
      notes.value = response.data
    } catch (error) {
      message.error('获取笔记失败')
      console.error('Failed to fetch notes:', error)
    }
  }

  const addNote = async (noteData: {
    videoId: string
    userId: string
    timestamp: number
    content: string
  }) => {
    try {
      const response = await videoApi.addNote(noteData.userId, noteData.videoId, noteData)
      notes.value.push(response.data)
      message.success('添加笔记成功')
    } catch (error) {
      message.error('添加笔记失败')
      console.error('Failed to add note:', error)
    }
  }

  const deleteNote = async (noteId: string) => {
    try {
      await videoApi.deleteNote(noteId)
      notes.value = notes.value.filter(n => n.id !== noteId)
      message.success('删除笔记成功')
    } catch (error) {
      message.error('删除笔记失败')
      console.error('Failed to delete note:', error)
    }
  }

  return {
    notes,
    fetchNotes,
    addNote,
    deleteNote
  }
}) 