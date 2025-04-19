<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
  >
    <div
      class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
      @click.stop
    >
      <!-- 标题 -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white">
          编辑个人资料
        </h2>
        <button
          @click="handleClose"
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- 表单 -->
      <form @submit.prevent="handleSubmit">
        <!-- 头像上传 -->
        <div class="mb-6 flex flex-col items-center">
          <div class="relative group mb-2">
            <div
              class="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700"
            >
              <img
                v-if="avatarPreview"
                :src="avatarPreview"
                alt="头像预览"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center text-gray-400"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-12 w-12"
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

            <!-- 上传按钮覆盖 -->
            <div
              class="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 rounded-full transition-all duration-300"
            >
              <label
                class="opacity-0 group-hover:opacity-100 cursor-pointer text-white bg-primary-light px-2 py-1 rounded-lg text-sm"
              >
                更换头像
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleAvatarChange"
                />
              </label>
            </div>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400">点击更换头像</p>
        </div>

        <!-- 昵称 -->
        <div class="mb-4">
          <label
            for="nickname"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            昵称
          </label>
          <input
            type="text"
            id="nickname"
            v-model="formData.nickname"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light/50 focus:border-primary-light dark:bg-gray-700 dark:text-white"
            placeholder="输入昵称"
          />
        </div>

        <!-- 个人简介 -->
        <div class="mb-6">
          <label
            for="bio"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            个人简介
          </label>
          <textarea
            id="bio"
            v-model="formData.bio"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light/50 focus:border-primary-light dark:bg-gray-700 dark:text-white resize-none"
            placeholder="介绍一下自己吧"
          ></textarea>
        </div>

        <!-- 按钮组 -->
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="handleClose"
            class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-gradient-to-r from-primary-light to-primary-dark text-white rounded-lg hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting" class="flex items-center">
              <svg
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              保存中...
            </span>
            <span v-else>保存</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import type { UserProfile } from "@/types/user";
import { useProfileStore } from "@/stores/profile";
import { ASSETS_BASE_URL } from "@/api/config";

const props = defineProps<{
  isOpen: boolean;
  userId: string;
  userProfile: UserProfile | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "success"): void;
}>();

const profileStore = useProfileStore();

// 表单数据
const formData = ref({
  nickname: "",
  bio: "",
  avatar: null as File | null,
});

// 头像预览
const avatarPreview = ref("");
const isSubmitting = ref(false);

// 初始化表单数据
watch(
  () => props.userProfile,
  (newProfile) => {
    console.log(newProfile);
    if (newProfile) {
      formData.value.nickname = newProfile.nickname || "";
      formData.value.bio = newProfile.bio || "";
      if (newProfile.avatar && !newProfile.avatar.startsWith("http")) {
        newProfile.avatar = ASSETS_BASE_URL + newProfile.avatar;
      }
      avatarPreview.value = newProfile.avatar || "";
    }
  },
  { immediate: true }
);

// 选择头像
const handleAvatarChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (files && files.length > 0) {
    const file = files[0];
    formData.value.avatar = file;

    // 创建预览
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

// 提交表单
const handleSubmit = async () => {
  if (isSubmitting.value) return;

  try {
    isSubmitting.value = true;

    // 构建更新数据
    const updateData: { nickname?: string; avatar?: string; bio?: string } = {};

    if (formData.value.nickname) {
      updateData.nickname = formData.value.nickname;
    }

    if (formData.value.bio) {
      updateData.bio = formData.value.bio;
    }

    // 处理头像
    if (formData.value.avatar) {
      // 在实际应用中，这里应该将文件上传到服务器
      // 这里简化为直接使用 base64 编码的图片数据
      const reader = new FileReader();
      await new Promise<void>((resolve) => {
        reader.onload = (e) => {
          updateData.avatar = e.target?.result as string;
          resolve();
        };
        reader.readAsDataURL(formData.value.avatar);
      });
    }

    // 提交更新
    const success = await profileStore.updateUserProfile(
      props.userId,
      updateData
    );

    if (success) {
      emit("success");
      handleClose();
    }
  } finally {
    isSubmitting.value = false;
  }
};

// 关闭模态框
const handleClose = () => {
  emit("close");
};

// 点击外部关闭
const handleOutsideClick = (event: MouseEvent) => {
  if (props.isOpen) {
    emit("close");
  }
};
</script>
