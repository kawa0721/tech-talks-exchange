
import { Button } from "@/components/ui/button";
import { ChangeEvent } from "react";

interface EditPostFormFooterProps {
  isSubmitting: boolean;
  onCancel: () => void;
  handleImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
}

const EditPostFormFooter = ({ 
  isSubmitting, 
  onCancel, 
  handleImageUpload 
}: EditPostFormFooterProps) => {
  return (
    <div className="flex justify-between w-full items-center border-t pt-3">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="flex gap-1"
        onClick={() => document.getElementById("edit-image-upload")?.click()}
      >
        <input
          id="edit-image-upload"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageUpload}
        />
        画像アップロード
      </Button>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          type="button" 
          onClick={onCancel}
        >
          キャンセル
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "更新中..." : "更新"}
        </Button>
      </div>
    </div>
  );
};

export default EditPostFormFooter;
