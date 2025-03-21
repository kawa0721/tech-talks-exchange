import { ReactNode, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import CreatePostButton from "@/components/CreatePostButton";
import CreatePostDialog from "@/components/CreatePostDialog";

interface IndexPageLayoutProps {
  children: ReactNode;
  selectedChannel: string | null;
  onSelectChannel: (channelId: string | null) => void;
  onPostCreated: () => void;
}

const IndexPageLayout = ({ 
  children, 
  selectedChannel, 
  onSelectChannel,
  onPostCreated
}: IndexPageLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar - 固定ヘッダー */}
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        {/* Sidebar Component */}
        <Sidebar
          selectedChannel={selectedChannel}
          onSelectChannel={onSelectChannel}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className={`main-content ${sidebarOpen ? 'with-sidebar' : ''}`}>
          {children}
        </main>
      </div>

      {/* 投稿ボタン（右下に固定） */}
      <CreatePostButton onClick={() => setIsPostDialogOpen(true)} />

      {/* 投稿ダイアログ */}
      <CreatePostDialog
        isOpen={isPostDialogOpen}
        onClose={() => setIsPostDialogOpen(false)}
        channelId={selectedChannel}
        onPostCreated={onPostCreated}
      />
    </div>
  );
};

export default IndexPageLayout;
