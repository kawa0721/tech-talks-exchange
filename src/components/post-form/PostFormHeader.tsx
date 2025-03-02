
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

interface PostFormHeaderProps {
  title: string;
  setTitle: (title: string) => void;
  userAvatarUrl?: string;
  userName?: string;
}

const PostFormHeader = ({
  title,
  setTitle,
  userAvatarUrl,
  userName
}: PostFormHeaderProps) => {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-9 w-9">
        <AvatarImage src={userAvatarUrl || "https://i.pravatar.cc/150?img=1"} alt={userName || "@user"} />
        <AvatarFallback>{userName?.substring(0, 2) || "U"}</AvatarFallback>
      </Avatar>
      <Input
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="font-medium"
      />
    </div>
  );
};

export default PostFormHeader;
