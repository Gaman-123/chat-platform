import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-16 md:pt-20 px-0 md:px-4 h-full md:h-auto">
        <div className="bg-base-100 md:rounded-lg shadow-cl w-full max-w-6xl h-full md:h-[calc(100vh-8rem)]">
          <div className="flex h-full md:rounded-lg overflow-hidden">
            {/* Sidebar: Full width on mobile when no user selected, hidden when chat selected */}
            <div className={`${selectedUser ? "hidden md:block" : "w-full md:w-auto"}`}>
              <Sidebar />
            </div>

            {/* ChatContainer / NoChatSelected: Full width on mobile when user selected */}
            <div className={`flex-1 flex flex-col ${!selectedUser ? "hidden md:flex" : "w-full"}`}>
              {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;
