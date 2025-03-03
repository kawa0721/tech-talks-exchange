
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Post } from "@/types";
import { usePostEdit } from "@/hooks/usePostEdit";
import PostFormEditor from "./post-form/PostFormEditor";
import PostFormImageUpload from "./post-form/PostFormImageUpload";
import EditPostFormFooter from "./post-form/EditPostFormFooter";
import ChannelSelector from "./post-form/ChannelSelector";

interface EditPostFormProps {
  post: Post;
  onPostUpdated: () => void;
}

const EditPostForm = ({ post, onPostUpdated }: EditPostFormProps) => {
  const {
    title,
    setTitle,
    content,
    setContent,
    htmlContent,
    setHtmlContent,
    images,
    isSubmitting,
    channelId,
    setChannelId,
    handleImageUpload,
    removeImage,
    handleSubmit
  } = usePostEdit({ post, onPostUpdated });

  return (
    <Card className="mb-6 border-0 shadow-none">
      <form onSubmit={handleSubmit}>
        <CardHeader className="pb-3 pt-4">
          <Input
            placeholder="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium"
          />
          <div className="mt-2">
            <ChannelSelector 
              selectedChannel={channelId} 
              onChannelChange={setChannelId} 
            />
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <PostFormEditor 
            htmlContent={htmlContent}
            setHtmlContent={setHtmlContent}
            content={content}
            setContent={setContent}
          />
          
          <PostFormImageUpload 
            images={images} 
            removeImage={removeImage} 
          />
        </CardContent>
        <CardFooter>
          <EditPostFormFooter
            isSubmitting={isSubmitting}
            onCancel={onPostUpdated}
            handleImageUpload={handleImageUpload}
          />
        </CardFooter>
      </form>
    </Card>
  );
};

export default EditPostForm;
