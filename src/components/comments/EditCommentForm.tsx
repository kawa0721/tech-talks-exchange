
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface EditCommentFormProps {
  id?: string;
  content: string;
  onSetContent?: (id: string, content: string) => void;
  onChange?: (content: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isReply?: boolean;
  isSubmitting?: boolean;
}

const EditCommentForm = ({
  id,
  content,
  onSetContent,
  onChange,
  onSave,
  onCancel,
  isReply = false,
  isSubmitting = false
}: EditCommentFormProps) => {
  // Handle content change based on what was provided
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onSetContent && id) {
      onSetContent(id, e.target.value);
    } else if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="mt-1">
      <Textarea
        value={content}
        onChange={handleContentChange}
        className={isReply ? "min-h-[60px] mb-2 text-sm" : "min-h-[80px] mb-2"}
      />
      <div className="flex gap-2">
        <Button 
          size="sm" 
          onClick={onSave}
          disabled={isSubmitting}
          className={isReply ? "h-7 px-2 text-xs flex items-center gap-1" : "flex items-center gap-1"}
        >
          <Check className={isReply ? "h-3 w-3" : "h-4 w-4"} />
          保存
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
          className={isReply ? "h-7 px-2 text-xs flex items-center gap-1" : "flex items-center gap-1"}
        >
          <X className={isReply ? "h-3 w-3" : "h-4 w-4"} />
          キャンセル
        </Button>
      </div>
    </div>
  );
};

export default EditCommentForm;
