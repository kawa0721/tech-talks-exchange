
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usePostCreation } from "@/hooks/usePostCreation";
import PostFormHeader from "./PostFormHeader";
import PostFormEditor from "./PostFormEditor";
import PostFormImageUpload from "./PostFormImageUpload";
import PostFormFooter from "./PostFormFooter";

interface CreatePostFormContainerProps {
  channelId: string | null;
  onPostCreated: () => void;
}

const CreatePostFormContainer = ({ 
  channelId, 
  onPostCreated 
}: CreatePostFormContainerProps) => {
  const {
    title,
    setTitle,
    content,
    setContent,
    htmlContent,
    setHtmlContent,
    images,
    isSubmitting,
    guestNickname,
    setGuestNickname,
    user,
    handleImageUpload,
    removeImage,
    handleSubmit
  } = usePostCreation({ channelId, onPostCreated });

  return (
    <Card className="mb-6">
      <form onSubmit={handleSubmit}>
        <CardHeader className="pb-3 pt-4">
          <PostFormHeader 
            title={title}
            setTitle={setTitle}
            userAvatarUrl={user?.user_metadata?.avatar_url}
            userName={user?.user_metadata?.name}
          />
          
          {!user && (
            <div className="mt-2">
              <Input
                placeholder="ニックネーム（任意）"
                value={guestNickname}
                onChange={(e) => setGuestNickname(e.target.value)}
                className="w-full"
              />
            </div>
          )}
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
        <CardFooter className="flex justify-between">
          <PostFormFooter 
            isSubmitting={isSubmitting} 
            handleImageUpload={handleImageUpload} 
          />
        </CardFooter>
      </form>
    </Card>
  );
};

export default CreatePostFormContainer;
