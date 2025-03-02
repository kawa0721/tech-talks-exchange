
import { useState } from "react";
import { CHANNELS } from "@/lib/data";
import ChannelList from "@/components/ChannelList";

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
  return (
    <>
      {/* Sidebar */}
      <aside
        className={`sidebar ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="sidebar-content">
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
