import { userService } from "@/services/userService";
import type { UserState } from "@/types/store";
import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { toast } from "sonner";
import { useChatStore } from "./useChatStore";
import axios from "axios";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? fallback;
  }

  return fallback;
};

export const useUserStore = create<UserState>(() => ({
  updateProfile: async (data) => {
    try {
      const updatedUser = await userService.updateProfile(data);
      useAuthStore.getState().setUser(updatedUser);
      await useChatStore.getState().fetchConversations();
      toast.success("Cập nhật hồ sơ thành công.");
    } catch (error) {
      console.error("Lỗi khi cập nhật hồ sơ", error);
      toast.error(getErrorMessage(error, "Cập nhật hồ sơ không thành công."));
      throw error;
    }
  },

  updateAvatarUrl: async (formData) => {
    try {
      const { user, setUser } = useAuthStore.getState();
      const data = await userService.uploadAvatar(formData);

      if (user) {
        setUser({
          ...user,
          avatarUrl: data.avatarUrl,
        });

        await useChatStore.getState().fetchConversations();
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật ảnh đại diện", error);
      toast.error(getErrorMessage(error, "Tải ảnh đại diện không thành công."));
    }
  },
}));
