import { create } from "zustand";
import { io, type Socket } from "socket.io-client";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./useAuthStore";
import type { SocketState } from "@/types/store";
import { useChatStore } from "./useChatStore";

const baseURL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:5001";

export const useSocketStore = create<SocketState>()(
  persist(
    (set, get) => ({
      socket: null,
      onlineUsers: [],
      showOnlineStatus: true,

      connectSocket: () => {
        const accessToken = useAuthStore.getState().accessToken;
        const existingSocket = get().socket;

        if (existingSocket) return;

        const socket: Socket = io(baseURL, {
          auth: {
            token: accessToken,
            showOnlineStatus: get().showOnlineStatus,
          },
          transports: ["websocket"],
        });

        set({ socket });

        socket.on("connect", () => {
          console.log("Đã kết nối với socket");
          socket.emit("online-visibility", get().showOnlineStatus);
        });

        socket.on("online-users", (userIds) => {
          set({ onlineUsers: userIds });
        });

        socket.on("new-message", ({ message, conversation, unreadCounts }) => {
          useChatStore.getState().addMessage(message);

          const lastMessage = {
            _id: conversation.lastMessage._id,
            content: conversation.lastMessage.content,
            createdAt: conversation.lastMessage.createdAt,
            sender: {
              _id: conversation.lastMessage.senderId,
              displayName: "",
              avatarUrl: null,
            },
          };

          const updatedConversation = {
            ...conversation,
            lastMessage,
            unreadCounts,
          };

          if (
            useChatStore.getState().activeConversationId === message.conversationId
          ) {
            useChatStore.getState().markAsSeen();
          }

          useChatStore.getState().updateConversation(updatedConversation);
        });

        socket.on("read-message", ({ conversation, lastMessage }) => {
          const updated = {
            _id: conversation._id,
            lastMessage,
            lastMessageAt: conversation.lastMessageAt,
            unreadCounts: conversation.unreadCounts,
            seenBy: conversation.seenBy,
          };

          useChatStore.getState().updateConversation(updated);
        });

        socket.on("new-group", (conversation) => {
          useChatStore.getState().addConvo(conversation);
          socket.emit("join-conversation", conversation._id);
        });
      },

      disconnectSocket: () => {
        const socket = get().socket;
        if (socket) {
          socket.disconnect();
          set({ socket: null, onlineUsers: [] });
        }
      },

      setShowOnlineStatus: (show) => {
        set({ showOnlineStatus: show });
        get().socket?.emit("online-visibility", show);
      },
    }),
    {
      name: "socket-preferences",
      partialize: (state) => ({ showOnlineStatus: state.showOnlineStatus }),
    }
  )
);
