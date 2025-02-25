<template>
  <div class="space-y-3">
    <!-- 空状态 -->
    <div 
      v-if="!notes.length"
      class="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
      <p class="text-sm">暂无笔记</p>
    </div>

    <!-- 笔记列表 -->
    <div 
      v-else
      v-for="note in notes" 
      :key="note.id"
      class="group relative bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden transition-all duration-200 hover:ring-1 hover:ring-primary-light/30"
    >
      <div class="p-3">
        <!-- 笔记头部 -->
        <div class="flex justify-between items-start">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-medium text-gray-500 dark:text-gray-400 tabular-nums">
                {{ formatTime(note.timestamp) }}
              </span>
              <time 
                :datetime="note.createdAt"
                class="text-xs text-gray-400 dark:text-gray-500"
              >
                {{ formatDate(note.createdAt) }}
              </time>
            </div>
            <p class="text-sm text-gray-900 dark:text-white break-words">
              {{ note.content }}
            </p>
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-center gap-1 ml-2">
            <button 
              @click="() => $emit('select', note.timestamp)"
              class="p-1.5 text-gray-500 hover:text-primary-light dark:text-gray-400 dark:hover:text-primary-light rounded-lg transition-colors"
              title="跳转到此处"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button 
              @click="() => handleDelete(note.id)"
              class="p-1.5 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-500 rounded-lg transition-colors"
              title="删除笔记"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconPlay from '@/components/icons/IconPlay.vue'
import IconTrash from '@/components/icons/IconTrash.vue'
import { useNotesStore } from '@/stores/notes'
import type { Note } from '@/api/notes'

const props = defineProps<{
  notes: Note[]
}>()

defineEmits<{
  (e: 'select', timestamp: number): void
}>()

const notesStore = useNotesStore()

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleDelete = async (noteId: string) => {
  if (confirm('确定要删除这条笔记吗？')) {
    await notesStore.deleteNote(noteId)
  }
}
</script> 