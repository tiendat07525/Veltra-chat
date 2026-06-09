import { friendService } from "@/services/friendService";
import type { FriendState } from "@/types/store";
import axios from "axios";
import { create } from "zustand";

export const useFriendStore = create<FriendState>((set) => ({
  friends: [],
  loading: false,
  receivedList: [],
  sentList: [],
  searchByUsername: async (username) => {
    try {
      set({ loading: true });

      return await friendService.searchByUsername(username);
    } catch (error) {
      console.error("Error searching user by username", error);
      return null;
    } finally {
      set({ loading: false });
    }
  },
  addFriend: async (to, message) => {
    try {
      set({ loading: true });
      return await friendService.sendFriendRequest(to, message);
    } catch (error) {
      console.error("Error sending friend request", error);

      const serverMessage = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;

      throw new Error(serverMessage ?? "Không thể gửi lời mời kết bạn. Vui lòng thử lại.");
    } finally {
      set({ loading: false });
    }
  },
  getAllFriendRequests: async () => {
    try {
      set({ loading: true });

      const result = await friendService.getAllFriendRequest();

      if (!result) return;

      const { received, sent } = result;

      set({ receivedList: received, sentList: sent });
    } catch (error) {
      console.error("Error loading friend requests", error);
    } finally {
      set({ loading: false });
    }
  },
  acceptRequest: async (requestId) => {
    try {
      set({ loading: true });
      const newFriend = await friendService.acceptRequest(requestId);

      set((state) => ({
        receivedList: state.receivedList.filter((r) => r._id !== requestId),
        friends: newFriend ? [newFriend, ...state.friends] : state.friends,
      }));
    } catch (error) {
      console.error("Error accepting friend request", error);
      const serverMessage = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;

      throw new Error(serverMessage ?? "Không thể chấp nhận lời mời kết bạn. Vui lòng thử lại.");
    } finally {
      set({ loading: false });
    }
  },
  declineRequest: async (requestId) => {
    try {
      set({ loading: true });
      await friendService.declineRequest(requestId);

      set((state) => ({
        receivedList: state.receivedList.filter((r) => r._id !== requestId),
      }));
    } catch (error) {
      console.error("Error declining friend request", error);
      const serverMessage = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;

      throw new Error(serverMessage ?? "Không thể từ chối lời mời kết bạn. Vui lòng thử lại.");
    } finally {
      set({ loading: false });
    }
  },
  getFriends: async () => {
    try {
      set({ loading: true });
      const friends = await friendService.getFriendList();
      set({ friends });
    } catch (error) {
      console.error("Error loading friends", error);
      set({ friends: [] });
    } finally {
      set({ loading: false });
    }
  },
}));
