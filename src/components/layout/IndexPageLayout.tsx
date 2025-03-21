import { ReactNode, useState, useEffect, useRef } from "react";
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
  // ローカルストレージから初期ピン状態を取得
  const getInitialPinState = () => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('sidebarPinned');
    return saved === 'true';
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(getInitialPinState);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isWideScreen, setIsWideScreen] = useState(false);
  const initialized = useRef(false);
  
  // ピン状態をローカルストレージに保存
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarPinned', String(sidebarPinned));
      console.log('Saved pin state to localStorage:', sidebarPinned);
    }
  }, [sidebarPinned]);
  
  // 画面幅の検出と変更の監視 - クライアントサイドでのみ実行
  useEffect(() => {
    // サーバーサイドレンダリング時には実行しない
    if (typeof window === 'undefined') return;
    
    const checkWidth = () => {
      const wideScreen = window.innerWidth >= 1024;
      setIsWideScreen(wideScreen);
      
      // 初期化済みフラグを設定
      if (!initialized.current) {
        initialized.current = true;
        
        // 初期状態: 画面幅が広い場合はサイドバーを開く
        if (wideScreen) {
          setSidebarOpen(true);
        }
      }
      
      // ピン留めされていて広い画面なら、サイドバーを開く
      if (wideScreen && sidebarPinned) {
        setSidebarOpen(true);
      }
    };
    
    // 初期チェック
    checkWidth();
    
    // リサイズイベントリスナー
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, [sidebarPinned]); // sidebarPinnedのみを依存配列に含める
  
  // ピン状態が変更されたときの処理
  const handlePinChange = (isPinned: boolean) => {
    console.log('Pin state changing to:', isPinned); // デバッグ用
    
    // 状態を更新
    setSidebarPinned(isPinned);
    
    // ピン留めされたらサイドバーを確実に開く
    if (isPinned) {
      setSidebarOpen(true);
    }
  };

  // サイドバーを開閉するハンドラー
  const toggleSidebar = () => {
    console.log('Toggle sidebar, current state:', sidebarOpen);
    setSidebarOpen(prev => !prev);
  };

  console.log('Rendering IndexPageLayout, isPinned:', sidebarPinned); // レンダリング時の状態確認

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar - 固定ヘッダー */}
      <Navbar onToggleSidebar={toggleSidebar} />

      <div className="flex">
        {/* Sidebar Component */}
        <Sidebar
          selectedChannel={selectedChannel}
          onSelectChannel={onSelectChannel}
          isOpen={sidebarOpen || (isWideScreen && sidebarPinned)}
          onClose={() => setSidebarOpen(false)}
          isPinned={sidebarPinned}
          onPinChange={handlePinChange}
        />

        {/* Main Content */}
        <main className={`main-content ${(sidebarOpen || (isWideScreen && sidebarPinned)) ? 'with-sidebar' : ''}`}>
          {children}
        </main>
      </div>

      {/* 投稿ボタン（右下に固定） */}
      <CreatePostButton channelId={selectedChannel || undefined} />

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
