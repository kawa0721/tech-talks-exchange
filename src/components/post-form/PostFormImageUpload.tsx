
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PostFormImageUploadProps {
  images: string[];
  removeImage: (index: number) => void;
}

const PostFormImageUpload = ({ images, removeImage }: PostFormImageUploadProps) => {
  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-2 mt-3">
      {images.map((src, index) => (
        <div key={index} className="relative rounded-md overflow-hidden">
          <img src={src} alt="アップロードプレビュー" className="h-24 w-full object-cover" />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6"
            onClick={() => removeImage(index)}
            type="button"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default PostFormImageUpload;
