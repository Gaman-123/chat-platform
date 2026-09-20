import { X, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="px-4 py-3 border-b border-base-300 bg-base-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Back button for mobile view */}
          <button
            onClick={() => setSelectedUser(null)}
            className="md:hidden btn btn-ghost btn-xs btn-circle mr-1"
            title="Back to contacts"
          >
            <ArrowLeft className="size-5" />
          </button>

          {/* Avatar with online dot */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
              {isOnline && (
                <span className="absolute bottom-0 right-0 size-2.5 bg-success rounded-full ring-2 ring-base-100" />
              )}
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-semibold text-sm">{selectedUser.fullName}</h3>
            <p className={`text-xs font-medium ${isOnline ? "text-success" : "text-base-content/50"}`}>
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Close button for desktop view */}
        <button
          onClick={() => setSelectedUser(null)}
          className="hidden md:flex btn btn-ghost btn-sm btn-circle"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;
