import { defineStore } from "pinia";
import { ref } from "vue";
import { videoApi, type Note, type UpdateNoteParams } from "@/api/video";
import { message } from "@/utils/message";
import { useUserStore } from "@/stores/user";

export const useNotesStore = defineStore("notes", () => {
  const userStore = useUserStore();
  const notes = ref<Note[]>([]);
  const currentVideoId = ref<string>("");

  const fetchNotes = async (videoId: string) => {
    try {
      if (!userStore.isAuthenticated) {
        throw new Error("用户未登录");
      }

      currentVideoId.value = videoId;
      const { data } = await videoApi.getNotes(videoId);
      if (data.code === 0) {
        notes.value = data.data;
      } else {
        message.error(data.msg || "获取笔记失败");
      }
    } catch (error) {
      message.error("获取笔记失败");
      console.error("Failed to fetch notes:", error);
      throw error;
    }
  };

  const addNote = async (noteData: {
    videoId: string;
    timestamp: number;
    content: string;
  }) => {
    try {
      if (!notes.value) {
        notes.value = [];
      }
      const { data } = await videoApi.addNote(noteData);
      if (data.code === 0) {
        notes.value.push(data.data);
        message.success("添加笔记成功");
      } else {
        message.error(data.msg || "添加笔记失败");
      }
    } catch (error) {
      message.error("添加笔记失败");
      console.error("Failed to add note:", error);
    }
  };

  const updateNote = async (noteId: string, data: UpdateNoteParams) => {
    try {
      const response = await videoApi.updateNote(noteId, data)
      if (response.data.code === 0) {
        const index = notes.value.findIndex(n => n.id === noteId)
        if (index !== -1) {
          notes.value[index] = response.data.data
        }
        message.success('更新笔记成功')
      } else {
        message.error(response.data.msg || '更新笔记失败')
      }
    } catch (error) {
      message.error('更新笔记失败')
      console.error('Failed to update note:', error)
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const response = await videoApi.deleteNote(noteId)
      if (response.data.code === 0) {
        notes.value = notes.value.filter((n) => n.id !== noteId)
        message.success("删除笔记成功")
      } else {
        message.error(response.data.msg || "删除笔记失败")
      }
    } catch (error) {
      message.error("删除笔记失败")
      console.error("Failed to delete note:", error)
    }
  };

  return {
    notes,
    fetchNotes,
    addNote,
    updateNote,
    deleteNote,
  };
});
