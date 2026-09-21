import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

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
  const { authUser, socket } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);

    if (socket) {
      subscribeToMessages();
    }

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, socket, getMessages, subscribeToMessages, unsubscribeFromMessages]);

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
                  }}>
                  {message.geminiImage && (
                    <div className="mb-2 overflow-hidden rounded-lg border border-blue-200 shadow-sm bg-blue-50/50">
                      <img
                        src={message.geminiImage}
                        alt="Gemini Generated Art"
                        className="w-full max-h-72 object-cover rounded-lg hover:scale-105 transition-transform duration-300 min-h-[220px]"
                        loading="eager"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          e.target.onerror = () => {
                            e.target.onerror = null;
                            e.target.src = "https://picsum.photos/seed/cyberpunk/800/500";
                          };
                          e.target.src = `https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop&q=80`;
                        }}
                      />
                    </div>
                  )}
                  <div className="prose prose-sm max-w-none text-base-content"
                    style={{ fontSize: "0.875rem" }}>
                    <ReactMarkdown
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-lg font-bold mt-2 mb-1" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-base font-bold mt-2 mb-1" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-sm font-bold mt-2 mb-1" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-semibold text-primary" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-4 my-1 space-y-0.5" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-4 my-1 space-y-0.5" {...props} />,
                        li: ({node, ...props}) => <li className="text-sm" {...props} />,
                        p: ({node, ...props}) => <p className="mb-1 last:mb-0" {...props} />,
                        hr: ({node, ...props}) => <hr className="border-blue-200 my-2" {...props} />,
                        code: ({node, inline, ...props}) => inline 
                          ? <code className="bg-blue-100 px-1 rounded text-xs font-mono" {...props} />
                          : <code className="block bg-blue-50 p-2 rounded text-xs font-mono my-1 overflow-x-auto" {...props} />,
                        pre: ({node, ...props}) => <pre className="bg-blue-50 rounded overflow-x-auto my-1" {...props} />,
                      }}
                    >
                      {message.geminiResponse}
                    </ReactMarkdown>
                  </div>
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
