
import { Textarea } from "@/components/ui/textarea";

interface ProfileContentProps {
  isEditing: boolean;
  profileText: string;
  setProfileText: (value: string) => void;
}

export const ProfileContent = ({ 
  isEditing, 
  profileText, 
  setProfileText 
}: ProfileContentProps) => {
  return (
    <>
      <h3 className="text-lg font-semibold mb-2">プロフィール</h3>
      
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={profileText}
            onChange={(e) => setProfileText(e.target.value)}
            placeholder="あなたについて教えてください..."
            className="min-h-[120px] resize-none"
          />
        </div>
      ) : (
        <p className="text-muted-foreground whitespace-pre-line">
          {profileText || "プロフィールはまだ設定されていません。"}
        </p>
      )}
    </>
  );
};
