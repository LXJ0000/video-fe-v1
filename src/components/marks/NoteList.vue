<template>
  <div class="space-y-3">
    <!-- 空状态 -->
    <div 
      v-if="!safeNotes.length"
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
      v-for="note in safeNotes" 
      :key="note.id"
      class="group relative bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden transition-all duration-200 hover:ring-1 hover:ring-primary-light/30"
    >
      <div class="p-3">
        <!-- 笔记头部 -->
        <div class="flex justify-between items-start mb-2">
          <div class="flex items-center gap-2">
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

          <!-- 操作按钮 -->
          <div class="flex items-center gap-1">
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

        <!-- 添加编辑模式 -->
        <div v-if="editingNoteId === note.id" class="space-y-2">
          <div class="flex items-start gap-2">
            <div class="flex-1">
              <textarea
                v-model="editingContent"
                rows="4"
                class="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-primary-light dark:focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 resize-y"
                placeholder="支持 Markdown 格式..."
                @keydown.ctrl.enter="handleUpdateNote(note.id)"
              ></textarea>
              <div class="mt-1 text-xs text-gray-500">
                按 Ctrl + Enter 保存
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <button
                @click="handleUpdateNote(note.id)"
                class="px-3 py-1.5 text-xs text-white bg-primary-light rounded-lg hover:bg-primary transition-colors"
              >
                保存
              </button>
              <button
                @click="cancelEdit"
                class="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                取消
              </button>
            </div>
          </div>
          <div class="text-sm text-gray-500">
            预览：
          </div>
          <div 
            class="prose prose-sm dark:prose-invert max-w-none p-3 bg-white dark:bg-gray-900 rounded-lg"
            v-html="markdownToHtml(editingContent)"
          ></div>
        </div>
        <div 
          v-else 
          class="prose prose-sm dark:prose-invert max-w-none"
          v-html="markdownToHtml(note.content)"
          @dblclick="startEdit(note)"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useNotesStore } from '@/stores/notes'
import type { Note } from '@/api/video'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps<{
  notes: Note[] | null
}>()

const emit = defineEmits<{
  (e: 'select', timestamp: number): void
}>()

const notesStore = useNotesStore()

// 编辑相关状态
const editingNoteId = ref<string | null>(null)
const editingContent = ref('')

// 计算属性处理 null 值
const safeNotes = computed(() => props.notes || [])

// 开始编辑笔记
const startEdit = (note: Note) => {
  editingNoteId.value = note.id
  editingContent.value = note.content
}

// 取消编辑
const cancelEdit = () => {
  editingNoteId.value = null
  editingContent.value = ''
}

// 更新笔记
const handleUpdateNote = async (noteId: string) => {
  if (!editingContent.value.trim()) return
  const note = safeNotes.value.find(n => n.id === noteId)
  if (!note) return

  await notesStore.updateNote(noteId, {
    content: editingContent.value.trim(),
    timestamp: note.timestamp
  })
  cancelEdit()
}

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

// Markdown 转 HTML
const markdownToHtml = (content: string) => {
  return DOMPurify.sanitize(marked(content))
}
</script>

<style>
.prose {
  @apply text-gray-900 dark:text-gray-100;
}

.prose h1, .prose h2, .prose h3, .prose h4 {
  @apply text-gray-900 dark:text-white font-medium mt-4 first:mt-0;
}

.prose p {
  @apply my-2;
}

.prose ul, .prose ol {
  @apply my-2 pl-6;
}

.prose code {
  @apply px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm;
}

.prose pre {
  @apply p-3 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-x-auto;
}

.prose pre code {
  @apply bg-transparent p-0;
}

.prose blockquote {
  @apply pl-4 border-l-4 border-gray-200 dark:border-gray-700 italic;
}

.prose a {
  @apply text-primary-light hover:text-primary transition-colors;
}
</style> 