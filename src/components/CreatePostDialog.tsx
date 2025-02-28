
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
import { CHANNELS } from "@/lib/data";

interface CreatePostDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePostDialog = ({ isOpen, onClose }: CreatePostDialogProps) => {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  useEffect(() => {
    // Reset selected channel when dialog is opened
    if (isOpen) {
      setSelectedChannel(null);
    }
  }, [isOpen]);

  const handlePostCreated = () => {
    // Close the dialog after successful post creation
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>新規投稿を作成</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
            <X className="h-4 w-4" />
          </Button>
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
