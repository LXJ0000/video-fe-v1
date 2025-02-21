<template>
  <Menu as="div" class="relative video-action-menu">
    <MenuButton class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
      <EllipsisVerticalIcon class="w-5 h-5 text-gray-500" />
    </MenuButton>

    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <MenuItems class="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
        <div class="py-1">
          <!-- 编辑选项 -->
          <MenuItem v-slot="{ active }">
            <button
              @click="emit('edit')"
              :class="[
                active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300',
                'group flex w-full items-center px-4 py-2 text-sm'
              ]"
            >
              <PencilSquareIcon class="mr-3 h-5 w-5" />
              编辑
            </button>
          </MenuItem>

          <!-- 状态切换 -->
          <MenuItem v-slot="{ active }">
            <button
              @click="emit('toggle-status')"
              :class="[
                active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300',
                'group flex w-full items-center px-4 py-2 text-sm'
              ]"
            >
              <EyeIcon v-if="video.status === 'private'" class="mr-3 h-5 w-5" />
              <EyeSlashIcon v-else class="mr-3 h-5 w-5" />
              {{ video.status === 'private' ? '设为公开' : '设为私有' }}
            </button>
          </MenuItem>

          <!-- 删除选项 -->
          <MenuItem v-slot="{ active }">
            <button
              @click="emit('delete')"
              :class="[
                active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300',
                'group flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400'
              ]"
            >
              <TrashIcon class="mr-3 h-5 w-5" />
              删除
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </transition>
  </Menu>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import {
  EllipsisVerticalIcon,
  PencilSquareIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'
import type { VideoItem } from '../types/video'

defineProps<{
  video: VideoItem
}>()

const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'toggle-status'): void
  (e: 'delete'): void
}>()
</script> 