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
  // イニシャル用のフォールバック
  const name = userName || "AI";
  const initials = name ? name.charAt(0).toUpperCase() : "A";
  
  // AIAUアイコン画像を使用
  const aiauIconUrl = "/aiau_19_transparent.png";
  
  return (
    <div className="flex items-center gap-3 w-full">
      <Avatar className="h-9 w-9 flex-shrink-0">
        <AvatarImage src={aiauIconUrl} alt="AIAU" />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <Input
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="font-medium w-full"
      />
    </div>
  );
};

export default PostFormHeader;
