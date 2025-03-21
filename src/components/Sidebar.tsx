import { useEffect } from "react";
import { CHANNELS } from "@/lib/data";
import ChannelList from "@/components/ChannelList";
import { X } from "lucide-react";

interface SidebarProps {
  selectedChannel: string | null;
  onSelectChannel: (channelId: string | null) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ 
  selectedChannel, 
  onSelectChannel, 
  isOpen, 
  onClose 
}: SidebarProps) => {
  // isOpenの値が変わったときにログを出力
  useEffect(() => {
    console.log('Sidebar isOpen state:', isOpen);
  }, [isOpen]);
  
  return (
    <>
      {/* Sidebar */}
      <aside className={`sidebar ${!isOpen ? "closed" : ""}`}>
        <div className="sidebar-content">
          <div className="flex justify-end pt-1 px-2">
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
              onClose();
            }}
          />
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="mobile-overlay"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default Sidebar;
