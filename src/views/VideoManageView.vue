<template>
  <div class="video-manage-view container mx-auto px-4 py-8">
    <!-- 页面标题和操作按钮 -->
    <div
      class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
    >
      <div
        class="text-2xl font-semibold bg-gradient-to-r from-primary-light via-primary to-primary-dark bg-clip-text text-transparent"
      >
        视频管理
      </div>
      <div class="flex items-center gap-4">
        <!-- 全选按钮 -->
        <button
          @click="toggleSelectAll"
          class="inline-flex items-center px-4 h-9 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-full border border-gray-300 dark:border-gray-600 transition-colors duration-300"
        >
          <input
            type="checkbox"
            :checked="isAllSelected"
            :indeterminate="isIndeterminate"
            class="mr-2 rounded-md border-2 border-gray-300 dark:border-gray-600"
            @click.stop
          />
          {{ isAllSelected ? "取消全选" : "全选" }}
        </button>

        <!-- 批量删除按钮 -->
        <button
          @click="handleBatchDelete"
          :disabled="selectedVideos.length === 0"
          class="inline-flex items-center px-4 h-9 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-primary-light dark:text-primary-light text-sm font-medium rounded-full border border-primary-light dark:border-primary-light transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <TrashIcon class="w-4 h-4 mr-1.5" />
          批量删除
          {{ selectedVideos.length ? `(${selectedVideos.length})` : "" }}
        </button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="flex flex-col gap-4 mb-6">
      <!-- 状态和排序标签 -->
      <div
        class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
      >
        <span>状态：</span>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="status in statusOptions"
            :key="status.value"
            @click="filters.status = status.value"
            :class="[
              'px-4 h-8 rounded-full text-sm transition-colors duration-300',
              filters.status === status.value
                ? 'bg-primary-light text-white'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300',
            ]"
          >
            {{ status.label }}
          </button>
        </div>
      </div>

      <!-- 排序选项 -->
      <div
        class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
      >
        <span>排序：</span>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="sort in sortOptions"
            :key="sort.value"
            @click="handleSortChange(sort.value)"
            :class="[
              'px-4 h-8 rounded-full text-sm transition-colors duration-300',
              filters.sortBy === sort.value
                ? 'bg-primary-light text-white'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300',
            ]"
          >
            {{ sort.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- 视频列表 -->
    <div
      v-if="!isLoading && videoStore.videos.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <VideoCard
        v-for="video in videoStore.videos"
        :key="video.id"
        :video="video"
        :class="{ 'video-card': true }"
        v-bind="$attrs"
        @click="(event) => handleCardClick(video.id, event)"
        @update="handleVideoUpdate"
        @delete="handleVideoDelete"
        :showActions="true"
      />
    </div>

    <!-- 空状态 -->
    <div
      v-if="!isLoading && videoStore.videos.length === 0"
      class="flex flex-col items-center justify-center py-16"
    >
      <div
        class="w-24 h-24 mb-4 rounded-full bg-gray-100 flex items-center justify-center"
      >
        <InboxIcon class="w-12 h-12 text-gray-400" />
      </div>
      <h3 class="text-lg font-medium text-gray-900">暂无视频</h3>
      <p class="mt-1 text-gray-500">点击右上角的"上传视频"添加新视频</p>
    </div>

    <!-- 加载更多 -->
    <div
      v-if="hasMore && !isLoading && videoStore.videos.length > 0"
      class="mt-8 text-center"
    >
      <button
        @click="loadMore"
        :disabled="isLoadingMore"
        class="px-6 h-10 bg-white hover:bg-gray-50 text-[#FF1493] text-sm font-medium rounded-full border border-[#FF1493] transition-colors duration-300"
      >
        {{ isLoadingMore ? "加载中..." : "加载更多" }}
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="py-16 text-center">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-[3px] border-[#FF1493] border-t-transparent"
      ></div>
    </div>

    <!-- 批量删除确认对话框 -->
    <Dialog
      v-model="showBatchDeleteDialog"
      title="确认删除"
      :content="`确定要删除选中的 ${selectedVideos.length} 个视频吗？此操作无法撤销。`"
      :loading="isDeleting"
      @confirm="confirmBatchDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from "vue";
import { useVideoStore } from "../stores/video";
import VideoCard from "../components/VideoCard.vue";
import Dialog from "../components/Dialog.vue";
import { TrashIcon, InboxIcon } from "@heroicons/vue/24/outline";
import type {
  VideoItem,
  VideoStatusFilter,
  SortField,
  SortOrder,
} from "../types/video";
import { useRouter } from "vue-router";

const videoStore = useVideoStore();
const selectedVideos = ref<string[]>([]);
const currentPage = ref(1);
const hasMore = ref(true);
const isLoadingMore = ref(false);
const showBatchDeleteDialog = ref(false);
const isDeleting = ref(false);
const isLoading = ref(false);

const filters = reactive({
  status: "" as VideoStatusFilter,
  sortBy: "created_at" as SortField,
  sortOrder: "desc" as SortOrder,
});

const router = useRouter();

// 状态选项
const statusOptions = [
  { label: "全部", value: "" },
  { label: "公开", value: "public" },
  { label: "私有", value: "private" },
  { label: "草稿", value: "draft" },
] as const;

// 排序选项
const sortOptions = [
  { label: "最新发布", value: "created_at" },
  { label: "最多播放", value: "views" },
  { label: "最多点赞", value: "likes" },
  { label: "文件大小", value: "file_size" },
] as const;

// 全选相关
const isAllSelected = computed(() => {
  return (
    videoStore.videos.length > 0 &&
    selectedVideos.value.length === videoStore.videos.length
  );
});

const isIndeterminate = computed(() => {
  return (
    selectedVideos.value.length > 0 &&
    selectedVideos.value.length < videoStore.videos.length
  );
});

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedVideos.value = [];
  } else {
    selectedVideos.value = videoStore.videos.map((video) => video.id);
  }
};

// 监听筛选条件变化
watch(
  filters,
  async () => {
    try {
      isLoading.value = true;
      currentPage.value = 1;
      const response = await videoStore.fetchVideos(1, 12, {
        status: filters.status,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });
      hasMore.value = response.data.total > videoStore.videos.length;
    } catch (err) {
      console.error("Filter videos failed:", err);
    } finally {
      isLoading.value = false;
    }
  },
  { deep: true }
);

// 修改加载视频列表函数
const loadVideos = async () => {
  try {
    isLoading.value = true;
    const response = await videoStore.fetchVideos(1, 12);
    currentPage.value = 1;
    hasMore.value = videoStore.total > videoStore.videos.length;
  } catch (err) {
    console.error("Load videos failed:", err);
  } finally {
    isLoading.value = false;
  }
};

// 修改加载更多函数
const loadMore = async () => {
  if (isLoadingMore.value) return;
  try {
    isLoadingMore.value = true;
    currentPage.value++;
    const response = await videoStore.fetchVideos(currentPage.value, 12);
    hasMore.value = response.data.total > videoStore.videos.length;
  } catch (err) {
    console.error("Load more failed:", err);
    currentPage.value--;
  } finally {
    isLoadingMore.value = false;
  }
};

// 切换选择
const toggleSelect = (id: string) => {
  const index = selectedVideos.value.indexOf(id);
  if (index === -1) {
    selectedVideos.value.push(id);
  } else {
    selectedVideos.value.splice(index, 1);
  }
};

// 处理视频更新
const handleVideoUpdate = (video: VideoItem) => {
  const index = videoStore.videos.findIndex((v) => v.id === video.id);
  if (index !== -1) {
    videoStore.videos[index] = video;
  }
};

// 处理视频删除
const handleVideoDelete = (video: VideoItem) => {
  videoStore.videos = videoStore.videos.filter((v) => v.id !== video.id);
  selectedVideos.value = selectedVideos.value.filter((id) => id !== video.id);
};

// 处理批量删除
const handleBatchDelete = () => {
  if (selectedVideos.value.length > 0) {
    showBatchDeleteDialog.value = true;
  }
};

// 确认批量删除
const confirmBatchDelete = async () => {
  try {
    isDeleting.value = true;
    await videoStore.batchUpdateVideos(selectedVideos.value, "delete");
    videoStore.videos = videoStore.videos.filter(
      (v) => !selectedVideos.value.includes(v.id)
    );
    selectedVideos.value = [];
    showBatchDeleteDialog.value = false;
  } catch (err) {
    console.error("Batch delete failed:", err);
  } finally {
    isDeleting.value = false;
  }
};

// 处理卡片点击
const handleCardClick = (videoId: string, event: Event) => {
  // 如果点击的是操作菜单区域或复选框，不进行跳转
  const target = event.target as HTMLElement;
  if (target?.closest(".video-action-menu")) {
    return;
  }
  router.push(`/video/${videoId}`);
};

// 确保类型安全的点击处理
const handleSortChange = (value: SortField) => {
  filters.sortBy = value;
};

onMounted(() => {
  loadVideos();
});

// 暴露 loadVideos 方法给父组件
defineExpose({
  loadVideos,
});
</script>
