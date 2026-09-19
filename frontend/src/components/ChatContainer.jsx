import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{
          backgroundColor: "#f8fafc",
          backgroundImage: `url("/chat-bg.jpg")`,
          backgroundSize: "200px",
          backgroundRepeat: "repeat"
        }}
      >
        {messages.map((message) => (
          <div key={message._id}>
            <div
              className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
              ref={messageEndRef}
            >
              <div className=" chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      message.senderId === authUser._id
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>
              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
              <div className={`chat-bubble flex flex-col ${message.senderId === authUser._id ? "bg-primary text-primary-content" : "bg-base-100 text-base-content border border-base-300"}`}>
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                {message.text && <p>{message.text}</p>}
              </div>
            </div>

            {/* Gemini AI Response Bubble */}
            {message.geminiResponse && (
              <div className="chat chat-start">
                <div className="chat-image avatar">
                  <div className="size-10 rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #4285F4, #34A853, #FBBC05, #EA4335)" }}>
                    <span className="text-white font-bold text-sm">G</span>
                  </div>
                </div>
                <div className="chat-header mb-1">
                  <span className="text-xs font-semibold" style={{ color: "#4285F4" }}>✨ Gemini AI</span>
                </div>
                <div className="chat-bubble text-base-content border"
                  style={{ 
                    background: "linear-gradient(135deg, #EBF5FB, #E8F8F5)", 
                    borderColor: "#7BAEE0",
                    maxWidth: "80%",
                    whiteSpace: "pre-wrap"
                  }}>
                  <p>{message.geminiResponse}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
