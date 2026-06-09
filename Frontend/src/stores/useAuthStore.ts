import { create } from "zustand";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import type { AuthState } from "@/types/store";
import { persist } from "zustand/middleware";
import { useChatStore } from "./useChatStore";
import axios from "axios";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? fallback;
  }

  return fallback;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      loading: false,

      setAccessToken: (accessToken) => {
        set({ accessToken });
      },
      setUser: (user) => {
        set({ user });
      },
      clearState: () => {
        set({ accessToken: null, user: null, loading: false });
        useChatStore.getState().reset();
        localStorage.clear();
        sessionStorage.clear();
      },
      signUp: async (username, password, email, firstName, lastName) => {
        try {
          set({ loading: true });
          await authService.signUp(username, password, email, firstName, lastName);

          toast.success("Đăng ký thành công. Hãy đăng nhập để tiếp tục.");
          return true;
        } catch (error) {
          console.error(error);
          toast.error(getErrorMessage(error, "Đăng ký không thành công."));
          return false;
        } finally {
          set({ loading: false });
        }
      },
      signIn: async (username, password) => {
        try {
          get().clearState();
          set({ loading: true });

          const { accessToken } = await authService.signIn(username, password);
          get().setAccessToken(accessToken);

          await get().fetchMe();
          useChatStore.getState().fetchConversations();

          toast.success("Đăng nhập thành công.");
          return true;
        } catch (error) {
          console.error(error);
          toast.error(getErrorMessage(error, "Đăng nhập không thành công."));
          return false;
        } finally {
          set({ loading: false });
        }
      },
      signOut: async () => {
        try {
          get().clearState();
          await authService.signOut();
          toast.success("Đăng xuất thành công.");
        } catch (error) {
          console.error(error);
          toast.error("Đăng xuất không thành công.");
        }
      },
      fetchMe: async () => {
        try {
          set({ loading: true });
          const user = await authService.fetchMe();

          set({ user });
        } catch (error) {
          console.error(error);
          set({ user: null, accessToken: null });
          toast.error("Không thể lấy thông tin người dùng.");
        } finally {
          set({ loading: false });
        }
      },
      refresh: async (silent = false) => {
        try {
          set({ loading: true });
          const { user, fetchMe, setAccessToken } = get();
          const accessToken = await authService.refresh();

          setAccessToken(accessToken);

          if (!user) {
            await fetchMe();
          }

          return true;
        } catch (error) {
          console.error(error);

          if (!silent) {
            toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          }

          get().clearState();
          return false;
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
