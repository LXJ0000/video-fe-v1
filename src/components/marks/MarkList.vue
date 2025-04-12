<template>
  <div class="space-y-3">
    <!-- 空状态 -->
    <div 
      v-if="!safeMarks.length"
      class="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p class="text-sm">暂无标记</p>
    </div>

    <!-- 标记列表 -->
    <div 
      v-else
      v-for="mark in safeMarks" 
      :key="mark.id"
      class="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700"
    >
      <div class="p-3">
        <!-- 标记头部 -->
        <div class="flex justify-between items-start">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-medium text-gray-500 dark:text-gray-400 tabular-nums">
                {{ formatTime(mark.timestamp) }}
              </span>
              <time 
                :datetime="mark.createdAt"
                class="text-xs text-gray-400 dark:text-gray-500"
              >
                {{ formatDate(mark.createdAt) }}
              </time>
            </div>
            <!-- 添加编辑模式 -->
            <div v-if="editingMarkId === mark.id" class="flex gap-2">
              <input
                v-model="editingContent"
                type="text"
                class="flex-1 px-2 py-1 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-primary-light dark:focus:border-primary-light focus:ring-2 focus:ring-primary-light/20"
                @keyup.enter="handleUpdateMark(mark.id)"
                @keyup.esc="cancelEdit"
              />
              <button
                @click="handleUpdateMark(mark.id)"
                class="px-2 py-1 text-xs text-white bg-primary-light rounded-lg hover:bg-primary transition-colors"
              >
                保存
              </button>
              <button
                @click="cancelEdit"
                class="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                取消
              </button>
            </div>
            <p 
              v-else 
              class="text-sm text-gray-900 dark:text-white break-words"
              @dblclick="startEdit(mark)"
            >
              {{ mark.content }}
            </p>
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-center gap-1 ml-2">
            <button 
              @click="() => $emit('select', mark.timestamp)"
              class="p-1.5 text-gray-500 hover:text-primary-light dark:text-gray-400 dark:hover:text-primary-light rounded-lg transition-colors"
              title="跳转到此处"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button 
              @click="() => handleDelete(mark.id)"
              class="p-1.5 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-500 rounded-lg transition-colors"
              title="删除标记"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 注释列表 -->
        <div v-if="mark.annotations?.length" class="mt-2 space-y-2">
          <div 
            v-for="annotation in mark.annotations" 
            :key="annotation.id"
            class="flex items-start gap-2 pl-3 border-l-2 border-gray-200 dark:border-gray-700"
          >
            <!-- 添加注释编辑模式 -->
            <div v-if="editingAnnotationId === annotation.id" class="flex-1 flex gap-2">
              <input
                v-model="editingContent"
                type="text"
                class="flex-1 px-2 py-1 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-primary-light dark:focus:border-primary-light focus:ring-2 focus:ring-primary-light/20"
                @keyup.enter="handleUpdateAnnotation(mark.id, annotation.id)"
                @keyup.esc="cancelEdit"
              />
              <button
                @click="handleUpdateAnnotation(mark.id, annotation.id)"
                class="px-2 py-1 text-xs text-white bg-primary-light rounded-lg hover:bg-primary transition-colors"
              >
                保存
              </button>
              <button
                @click="cancelEdit"
                class="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                取消
              </button>
            </div>
            <p 
              v-else
              class="flex-1 min-w-0 text-sm text-gray-600 dark:text-gray-300 break-words"
              @dblclick="startEditAnnotation(annotation)"
            >
              {{ annotation.content }}
            </p>
            <button
              @click="() => handleDeleteAnnotation(mark.id, annotation.id)"
              class="p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-500 rounded transition-colors"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 添加注释输入框 -->
        <div class="mt-2">
          <div class="relative">
            <input
              v-model="newAnnotations[mark.id]"
              @keyup.enter="handleAddAnnotation(mark.id)"
              placeholder="添加注释..."
              class="w-full pl-3 pr-8 py-1.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-light dark:focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
            />
            <button
              v-if="newAnnotations[mark.id]"
              @click="handleAddAnnotation(mark.id)"
              class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-primary-light hover:text-primary rounded transition-colors"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMarksStore } from '@/stores/marks'
import type { Mark } from '@/api/video'

const props = defineProps<{
  marks: Mark[] | null
}>()

const emit = defineEmits<{
  (e: 'select', timestamp: number): void
  (e: 'add-annotation', markId: string, content: string): void
}>()

// 计算属性处理 null 值
const safeMarks = computed(() => props.marks || [])

const marksStore = useMarksStore()
const newAnnotations = ref<Record<string, string>>({})

// 编辑相关状态
const editingMarkId = ref<string | null>(null)
const editingAnnotationId = ref<string | null>(null)
const editingContent = ref('')

// 开始编辑标记
const startEdit = (mark: Mark) => {
  editingMarkId.value = mark.id
  editingContent.value = mark.content
  editingAnnotationId.value = null
}

// 开始编辑注释
const startEditAnnotation = (annotation: { id: string; content: string }) => {
  editingAnnotationId.value = annotation.id
  editingContent.value = annotation.content
  editingMarkId.value = null
}

// 取消编辑
const cancelEdit = () => {
  editingMarkId.value = null
  editingAnnotationId.value = null
  editingContent.value = ''
}

// 更新标记
const handleUpdateMark = async (markId: string) => {
  if (!editingContent.value.trim()) return
  const mark = safeMarks.value.find(m => m.id === markId)
  if (!mark) return

  const newMark = mark
  newMark.content = editingContent.value.trim()
  await marksStore.updateMark(markId, mark)
  cancelEdit()
}

// 更新注释
const handleUpdateAnnotation = async (markId: string, annotationId: string) => {
  if (!editingContent.value.trim()) return
  await marksStore.updateAnnotation(markId, annotationId, editingContent.value.trim())
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

const handleAddAnnotation = async (markId: string) => {
  const content = newAnnotations.value[markId]
  if (content?.trim()) {
    await marksStore.addAnnotation(markId, content)
    newAnnotations.value[markId] = ''
  }
}

const handleDelete = async (markId: string) => {
  if (confirm('确定要删除这个标记吗？')) {
    await marksStore.deleteMark(markId)
  }
}

const handleDeleteAnnotation = async (markId: string, annotationId: string) => {
  if (confirm('确定要删除这条注释吗？')) {
    await marksStore.deleteAnnotation(markId, annotationId)
  }
}
</script> 