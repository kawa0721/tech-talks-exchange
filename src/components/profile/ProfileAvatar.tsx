
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

interface ProfileAvatarProps {
  avatarUrl: string | null;
  username: string;
  isEditing: boolean;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileAvatar = ({ 
  avatarUrl, 
  username, 
  isEditing, 
  onAvatarChange 
}: ProfileAvatarProps) => {
  return (
    <div className="relative group mx-auto sm:mx-0">
      <Avatar className="h-24 w-24 border-2 border-primary/20">
        <AvatarImage src={avatarUrl || undefined} alt={username} />
        <AvatarFallback className="bg-secondary text-secondary-foreground text-xl">
          {username.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      {isEditing && (
        <label 
          htmlFor="avatar-upload" 
          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Camera className="text-white" />
          <input 
            id="avatar-upload" 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={onAvatarChange}
          />
        </label>
      )}
    </div>
  );
};
