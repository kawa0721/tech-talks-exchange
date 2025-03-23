import { useEffect, useState } from "react";
import { CHANNELS } from "@/lib/data";
import ChannelList from "@/components/ChannelList";
import { X, Pin } from "lucide-react";

interface SidebarProps {
  selectedChannel: string | null;
  onSelectChannel: (channelId: string | null) => void;
  isOpen: boolean;
  onClose: () => void;
  isPinned?: boolean;
  onPinChange?: (isPinned: boolean) => void;
}

const Sidebar = ({ 
  selectedChannel, 
  onSelectChannel, 
  isOpen, 
  onClose,
  isPinned = false,
  onPinChange = () => {}
}: SidebarProps) => {
  // 内部状態としてピン状態も管理（propsと同期）
  const [internalPinned, setInternalPinned] = useState(isPinned);
  
  // 外部から渡されたisPinnedが変更されたら内部状態も更新
  useEffect(() => {
    setInternalPinned(isPinned);
  }, [isPinned]);
  
  // サイドバー状態のログ出力
  useEffect(() => {
    console.log('Sidebar state:', { isOpen, isPinned: internalPinned });
  }, [isOpen, internalPinned]);
  
  // ピン状態を切り替える関数
  const togglePin = () => {
    const newPinState = !internalPinned;
    console.log('Toggling pin state to:', newPinState);
    
    // 内部状態を即座に更新
    setInternalPinned(newPinState);
    
    // 親コンポーネントに通知
    onPinChange(newPinState);
  };
  
  return (
    <>
      {/* Overlay for closing sidebar when clicking outside */}
      {isOpen && !internalPinned && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside className={`sidebar ${!isOpen ? "closed" : ""} ${internalPinned ? "pinned" : ""}`}>
        <div className="sidebar-content">
          <div className="flex justify-end md:justify-between pt-1 px-2">
            <button 
              className={`max-md:hidden p-1 rounded-full ${internalPinned 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary/60 text-muted-foreground'} 
                hover:bg-primary/80 hover:text-primary-foreground z-50 shadow-sm flex items-center`}
              onClick={togglePin}
              aria-label={internalPinned ? "サイドバーのピンを外す" : "サイドバーをピン留めする"}
              title={internalPinned ? "ピン留めを解除" : "ピン留めする"}
              data-pinned={internalPinned}
            >
              <Pin className={`h-4 w-4 ${internalPinned ? 'fill-current' : ''}`} />
              <span className="ml-1 text-xs font-medium">{internalPinned ? "固定中" : "固定"}</span>
            </button>
            
            <button 
              className="p-1 rounded-full bg-primary hover:bg-primary/80 z-50 shadow-sm"
              onClick={onClose}
              aria-label="サイドバーを閉じる"
            >
              <X className="h-4 w-4 text-primary-foreground" />
            </button>
          </div>
          
          <ChannelList
            selectedChannel={selectedChannel}
            onSelectChannel={(channelId) => {
              onSelectChannel(channelId);
              if (!internalPinned) onClose();
            }}
          />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
