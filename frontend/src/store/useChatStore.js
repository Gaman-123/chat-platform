import React from "react";
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  unreadMessages: {}, // Map of userId -> count

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
      // Clear unread count for this user
      set((state) => ({
        unreadMessages: { ...state.unreadMessages, [userId]: 0 },
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending message");
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.off("updateMessageGemini");

    socket.on("newMessage", (newMessage) => {
      const { selectedUser } = get();
      const isMessageFromSelectedUser = selectedUser && newMessage.senderId === selectedUser._id;

      if (isMessageFromSelectedUser) {
        set({
          messages: [...get().messages, newMessage],
        });
      } else {
        // Increment unread count for the sender
        const currentCount = get().unreadMessages[newMessage.senderId] || 0;
        set((state) => ({
          unreadMessages: {
            ...state.unreadMessages,
            [newMessage.senderId]: currentCount + 1,
          },
        }));

        // Toast Popup Notification for incoming message
        const sender = get().users.find((u) => u._id === newMessage.senderId);
        const senderName = sender ? sender.fullName : "Someone";
        toast.custom(
          (t) =>
            React.createElement(
              "div",
              {
                className: `${
                  t.visible ? "animate-enter" : "animate-leave"
                } max-w-md w-full bg-base-100 shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-primary/20 p-3 items-center gap-3 cursor-pointer border border-primary/30`,
                onClick: () => {
                  if (sender) get().setSelectedUser(sender);
                  toast.dismiss(t.id);
                },
              },
              React.createElement(
                "div",
                { className: "size-10 rounded-full overflow-hidden flex-shrink-0 border border-primary" },
                React.createElement("img", {
                  src: sender?.profilePic || "/avatar.png",
                  alt: senderName,
                  className: "size-full object-cover",
                })
              ),
              React.createElement(
                "div",
                { className: "flex-1 min-w-0" },
                React.createElement("p", { className: "text-xs font-bold text-primary" }, senderName),
                React.createElement(
                  "p",
                  { className: "text-sm truncate text-base-content font-medium" },
                  newMessage.text || "Sent an attachment"
                )
              ),
              React.createElement(
                "span",
                { className: "badge badge-primary badge-sm text-[10px] animate-pulse" },
                "NEW"
              )
            ),
          { duration: 4000 }
        );
      }
    });

    socket.on("updateMessageGemini", ({ messageId, geminiResponse, geminiImage }) => {
      set({
        messages: get().messages.map((msg) =>
          msg._id === messageId ? { ...msg, geminiResponse, geminiImage } : msg
        ),
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
    socket.off("updateMessageGemini");
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
    if (selectedUser) {
      set((state) => ({
        unreadMessages: { ...state.unreadMessages, [selectedUser._id]: 0 },
      }));
    }
  },
}));
