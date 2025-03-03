
import CreatePostFormContainer from "@/components/post-form/CreatePostFormContainer";

interface CreatePostFormProps {
  channelId: string | null;
  onPostCreated: () => void;
}

const CreatePostForm = ({ channelId, onPostCreated }: CreatePostFormProps) => {
  return (
    <CreatePostFormContainer
      channelId={channelId}
      onPostCreated={onPostCreated}
    />
  );
};

export default CreatePostForm;
