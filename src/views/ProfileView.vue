<template>
  <div class="container mx-auto px-4 py-8">
    <!-- 返回按钮 -->
    <router-link
      to="/"
      class="inline-flex items-center mb-6 text-gray-600 dark:text-gray-400 hover:text-primary-dark dark:hover:text-primary-light transition-colors duration-300"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      返回首页
    </router-link>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="flex justify-center items-center py-16">
      <div
        class="animate-spin rounded-full h-12 w-12 border-4 border-primary-light border-t-transparent"
      ></div>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="text-center py-16">
      <div class="text-red-500 mb-4">{{ error }}</div>
      <button
        @click="loadProfile"
        class="px-4 py-2 bg-primary-light text-white rounded-full hover:bg-primary transition-colors duration-300"
      >
        重试
      </button>
    </div>

    <!-- 用户信息页面主体 -->
    <template v-else-if="profileStore.userProfile">
      <!-- 个人资料卡片 -->
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8"
      >
        <div class="md:flex">
          <!-- 左侧头像和基本信息 -->
          <div class="p-8 text-center md:text-left md:flex md:items-center">
            <!-- 头像 -->
            <div class="flex-shrink-0 mx-auto md:mx-0 mb-4 md:mb-0 md:mr-6">
              <div
                class="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700"
              >
                <img
                  v-if="profileStore.userProfile.avatar"
                  :src="profileStore.userProfile.avatar"
                  alt="用户头像"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center text-gray-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-16 w-16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <!-- 基本信息 -->
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                {{
                  profileStore.userProfile.nickname ||
                  profileStore.userProfile.username
                }}
              </h1>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                注册于 {{ formatDate(profileStore.userProfile.createdAt) }}
              </p>
              <p
                v-if="profileStore.userProfile.bio"
                class="mt-2 text-gray-600 dark:text-gray-300"
              >
                {{ profileStore.userProfile.bio }}
              </p>
              <p
                v-else
                class="mt-2 text-gray-500 dark:text-gray-400 italic text-sm"
              >
                这个人很懒，还没有填写个人简介...
              </p>

              <!-- 编辑按钮（仅对当前用户显示） -->
              <div v-if="isCurrentUser" class="mt-4">
                <button
                  @click="showEditModal = true"
                  class="px-4 py-2 bg-primary-light text-white rounded-lg hover:bg-primary-dark transition-colors duration-300"
                >
                  编辑资料
                </button>
              </div>
            </div>
          </div>

          <!-- 右侧统计信息 -->
          <div
            class="border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 p-8 bg-gray-50 dark:bg-gray-800/50"
          >
            <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
              数据统计
            </h2>
            <div class="grid grid-cols-3 gap-4">
              <div class="text-center">
                <div
                  class="text-2xl font-bold text-primary-dark dark:text-primary-light"
                >
                  {{ profileStore.userProfile.stats.videos }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">视频</div>
              </div>
              <div class="text-center">
                <div
                  class="text-2xl font-bold text-primary-dark dark:text-primary-light"
                >
                  {{ profileStore.userProfile.stats.followers }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">粉丝</div>
              </div>
              <div class="text-center">
                <div
                  class="text-2xl font-bold text-primary-dark dark:text-primary-light"
                >
                  {{ profileStore.userProfile.stats.following }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">关注</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 标签页导航 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md mb-6">
        <div class="border-b border-gray-200 dark:border-gray-700">
          <nav class="flex -mb-px">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              class="py-4 px-6 border-b-2 font-medium text-sm focus:outline-none transition-colors duration-200"
              :class="
                activeTab === tab.id
                  ? 'border-primary-dark text-primary-dark dark:border-primary-light dark:text-primary-light'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              "
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>
      </div>

      <!-- 标签页内容 -->
      <div class="min-h-[400px]">
        <!-- 用户上传的视频 -->
        <div v-if="activeTab === 'videos'" class="space-y-6">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">
            上传的视频
          </h2>

          <!-- 加载用户视频 -->
          <div v-if="isLoadingVideos" class="flex justify-center py-8">
            <div
              class="animate-spin rounded-full h-8 w-8 border-2 border-primary-light border-t-transparent"
            ></div>
          </div>

          <!-- 视频列表 -->
          <div
            v-else-if="videos.length > 0"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <template
              v-for="(video, index) in videos"
              :key="video.id || `video-${index}`"
            >
              <VideoCard
                :video="{
                  id: video.id || `temp-${index}`,
                  title: video.title || '无标题视频',
                  coverUrl: video.coverUrl || '',
                  thumbnailUrl: video.thumbnailUrl || '',
                  duration: video.duration || 0,
                  createdAt: video.createdAt || new Date().toISOString(),
                  fileSize: video.fileSize || 0,
                  status: video.status || 'public',
                  description: video.description || '',
                  format: video.format || '',
                  stats: video.stats || {
                    views: 0,
                    likes: 0,
                    comments: 0,
                    shares: 0,
                  },
                }"
              />
            </template>
          </div>

          <!-- 空状态 -->
          <div
            v-else
            class="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
          >
            <div
              class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              暂无视频
            </h3>
            <p class="mt-1 text-gray-500 dark:text-gray-400">
              该用户还没有上传任何视频
            </p>
          </div>

          <!-- 加载更多按钮 -->
          <div
            v-if="hasMoreVideos && !isLoadingVideos"
            class="text-center mt-8"
          >
            <button
              @click="loadMoreVideos"
              class="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              加载更多
            </button>
          </div>
        </div>

        <!-- 观看历史 -->
        <div v-else-if="activeTab === 'history'" class="space-y-6">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">
            观看历史
          </h2>

          <!-- 加载历史 -->
          <div
            v-if="profileStore.isLoadingHistory"
            class="flex justify-center py-8"
          >
            <div
              class="animate-spin rounded-full h-8 w-8 border-2 border-primary-light border-t-transparent"
            ></div>
          </div>

          <!-- 历史列表 -->
          <div
            v-else-if="
              profileStore.watchHistory &&
              profileStore.watchHistory.items &&
              profileStore.watchHistory.items.length > 0
            "
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <template
              v-for="(item, index) in profileStore.watchHistory.items"
              :key="item?.id || `history-${index}`"
            >
              <VideoCard
                :video="{
                  id: item?.id || `history-${index}`,
                  title: item?.title || '无标题视频',
                  coverUrl: item?.coverUrl || '',
                  thumbnailUrl: '',
                  duration: item?.duration || 0,
                  createdAt: item?.watchedAt || new Date().toISOString(),
                  fileSize: 0,
                  status: 'public',
                  description: '',
                  format: '',
                  stats: { views: 0, likes: 0, comments: 0, shares: 0 },
                }"
                :show-progress="true"
              />
            </template>
          </div>

          <!-- 空状态 -->
          <div
            v-else
            class="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
          >
            <div
              class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              暂无观看记录
            </h3>
            <p class="mt-1 text-gray-500 dark:text-gray-400">
              去发现一些精彩视频吧
            </p>
          </div>

          <!-- 加载更多按钮 -->
          <div
            v-if="profileStore.historyHasMore && !profileStore.isLoadingHistory"
            class="text-center mt-8"
          >
            <button
              @click="loadMoreHistory"
              class="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              加载更多
            </button>
          </div>
        </div>

        <!-- 收藏的视频 -->
        <div v-else-if="activeTab === 'favorites'" class="space-y-6">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">
            收藏的视频
          </h2>

          <!-- 加载收藏 -->
          <div
            v-if="profileStore.isLoadingFavorites"
            class="flex justify-center py-8"
          >
            <div
              class="animate-spin rounded-full h-8 w-8 border-2 border-primary-light border-t-transparent"
            ></div>
          </div>

          <!-- 收藏列表 -->
          <div
            v-else-if="
              profileStore.favorites &&
              profileStore.favorites.items &&
              profileStore.favorites.items.length > 0
            "
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <template
              v-for="(item, index) in profileStore.favorites.items"
              :key="item?.id || `favorite-${index}`"
            >
              <VideoCard
                :video="{
                  id: item?.id || `favorite-${index}`,
                  title: item?.title || '无标题视频',
                  coverUrl: item?.coverUrl || '',
                  thumbnailUrl: '',
                  duration: item?.duration || 0,
                  createdAt: item?.createdAt || new Date().toISOString(),
                  fileSize: 0,
                  status: 'public',
                  description: '',
                  format: '',
                  stats: { views: 0, likes: 0, comments: 0, shares: 0 },
                }"
              />
            </template>
          </div>

          <!-- 空状态 -->
          <div
            v-else
            class="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
          >
            <div
              class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              暂无收藏
            </h3>
            <p class="mt-1 text-gray-500 dark:text-gray-400">
              收藏喜欢的视频，方便以后观看
            </p>
          </div>

          <!-- 加载更多按钮 -->
          <div
            v-if="
              profileStore.favoritesHasMore && !profileStore.isLoadingFavorites
            "
            class="text-center mt-8"
          >
            <button
              @click="loadMoreFavorites"
              class="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              加载更多
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- 编辑资料模态框 -->
    <ProfileEditModal
      :is-open="showEditModal"
      :user-id="userId"
      :user-profile="profileStore.userProfile"
      @close="showEditModal = false"
      @success="handleProfileUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useProfileStore } from "@/stores/profile";
import { useUserStore } from "@/stores/user";
import { useVideoStore } from "@/stores/video";
import VideoCard from "@/components/VideoCard.vue";
import ProfileEditModal from "@/components/ProfileEditModal.vue";
import { videoApi } from "@/api/video";
import { ASSETS_BASE_URL } from "@/api/config";

const route = useRoute();
const profileStore = useProfileStore();
const userStore = useUserStore();
const videoStore = useVideoStore();

// 用户ID
const userId = computed(() => route.params.userId as string);

// 是否为当前登录用户的个人页面
const isCurrentUser = computed(() => {
  return userStore.currentUser && userStore.currentUser.id === userId.value;
});

// 标签页
const tabs = [
  { id: "videos", name: "视频" },
  { id: "history", name: "历史" },
  { id: "favorites", name: "收藏" },
];

// 状态
const activeTab = ref("videos");
const isLoading = ref(false);
const error = ref("");
const isLoadingVideos = ref(false);
const videos = ref<any[]>([]);
const videosPage = ref(1);
const hasMoreVideos = ref(false);
const showEditModal = ref(false);

// 加载个人资料
const loadProfile = async () => {
  try {
    isLoading.value = true;
    error.value = "";
    await profileStore.fetchUserProfile(userId.value);
    if (profileStore.userProfile.avatar !== null) {
      profileStore.userProfile.avatar =
        ASSETS_BASE_URL + profileStore.userProfile.avatar;
    }
  } catch (err) {
    error.value = "加载用户资料失败";
    console.error("加载用户资料失败:", err);
  } finally {
    isLoading.value = false;
  }
};

// 加载用户上传的视频
const loadUserVideos = async (page = 1, reset = false) => {
  try {
    isLoadingVideos.value = true;

    if (reset) {
      videos.value = [];
    }

    // 使用videoApi替代store方法直接调用API
    const response = await videoApi.getPublicVideos({
      page,
      pageSize: 12,
      userId: userId.value,
    });

    // 解析响应数据
    if (response.data && response.data.code === 0 && response.data.data) {
      const apiData = response.data.data;
      // 确保获取到items数组
      if (apiData.items && Array.isArray(apiData.items)) {
        if (reset || page === 1) {
          videos.value = apiData.items;
        } else {
          videos.value = [...videos.value, ...apiData.items];
        }

        hasMoreVideos.value = videos.value.length < (apiData.total || 0);
        videosPage.value = page;
      }
    }
  } catch (err) {
    console.error("加载用户视频失败:", err);
  } finally {
    isLoadingVideos.value = false;
  }
};

// 加载更多视频
const loadMoreVideos = () => {
  loadUserVideos(videosPage.value + 1);
};

// 加载更多历史记录
const loadMoreHistory = () => {
  profileStore.fetchWatchHistory(
    userId.value,
    profileStore.historyCurrentPage + 1
  );
};

// 加载更多收藏
const loadMoreFavorites = () => {
  profileStore.fetchFavorites(
    userId.value,
    profileStore.favoritesCurrentPage + 1
  );
};

// 处理标签切换
watch(activeTab, (newTab) => {
  if (newTab === "videos" && videos.value.length === 0) {
    loadUserVideos(1, true);
  } else if (
    newTab === "history" &&
    (!profileStore.watchHistory ||
      !profileStore.watchHistory.items ||
      profileStore.watchHistory.items.length === 0)
  ) {
    profileStore.fetchWatchHistory(userId.value, 1, true);
  } else if (
    newTab === "favorites" &&
    (!profileStore.favorites ||
      !profileStore.favorites.items ||
      profileStore.favorites.items.length === 0)
  ) {
    profileStore.fetchFavorites(userId.value, 1, true);
  }
});

// 处理资料更新成功
const handleProfileUpdated = () => {
  loadProfile();
};

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

// 监听路由参数变化，重新加载数据
watch(
  () => route.params.userId,
  () => {
    profileStore.resetState();
    loadProfile();
    if (activeTab.value === "videos") {
      loadUserVideos(1, true);
    }
  },
  { immediate: false }
);

// 页面加载时获取数据
onMounted(() => {
  loadProfile();
  loadUserVideos(1, true);
});
</script>
