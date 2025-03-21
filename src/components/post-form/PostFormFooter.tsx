import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChangeEvent } from "react";

interface PostFormFooterProps {
  isSubmitting: boolean;
  handleImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
}

const PostFormFooter = ({ isSubmitting, handleImageUpload }: PostFormFooterProps) => {
  return (
    <div className="flex flex-row items-center border-t p-3">
      <div className="flex-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="flex gap-1"
          onClick={() => document.getElementById("image-upload")?.click()}
        >
          <Upload className="h-4 w-4" />
          <span>アップロード</span>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageUpload}
          />
        </Button>
      </div>
      <div className="flex ml-auto">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "投稿中..." : "投稿"}
        </Button>
      </div>
    </div>
  );
};

export default PostFormFooter;
