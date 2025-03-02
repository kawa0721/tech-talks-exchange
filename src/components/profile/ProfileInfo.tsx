
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ProfileInfoProps {
  isEditing: boolean;
  username: string;
  setUsername: (value: string) => void;
  userId: string;
}

export const ProfileInfo = ({ 
  isEditing, 
  username, 
  setUsername, 
  userId 
}: ProfileInfoProps) => {
  return (
    <div className="text-center sm:text-left flex-1">
      {isEditing ? (
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="ニックネーム"
          className="font-semibold text-lg mb-2"
        />
      ) : (
        <CardTitle className="text-2xl">{username}</CardTitle>
      )}
      <CardDescription>ユーザーID: {userId}</CardDescription>
    </div>
  );
};
