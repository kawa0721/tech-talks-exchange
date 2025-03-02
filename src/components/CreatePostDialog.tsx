import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CreatePostForm from "@/components/CreatePostForm";
import { toast } from "sonner";

interface CreatePostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  channelId: string | null;
  onPostCreated?: () => void;
}

const CreatePostDialog = ({ isOpen, onClose, channelId, onPostCreated }: CreatePostDialogProps) => {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(channelId);

  useEffect(() => {
    // ダイアログが開かれた時に選択中のチャンネルをリセット
    if (isOpen) {
      console.log('CreatePostDialog opened with channelId:', channelId);
      setSelectedChannel(channelId);
    }
  }, [isOpen, channelId]);

  const handlePostCreated = () => {
    console.log('Post created successfully, closing dialog');
    // ダイアログを閉じる
    onClose();
    
    // 投稿作成成功のトーストを表示
    toast.success('投稿が作成されました！');
    
    // 親コンポーネントに投稿作成を通知
    if (onPostCreated) {
      console.log('Notifying parent component about post creation');
      onPostCreated();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log('Dialog open state changed:', open);
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>新規投稿を作成</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <CreatePostForm
            channelId={selectedChannel}
            onPostCreated={handlePostCreated}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;