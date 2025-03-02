
import { Button } from "@/components/ui/button";

interface ProfileFooterProps {
  isEditing: boolean;
  isLoading: boolean;
  onEdit: () => void;
  onCancel: () => void;
}

export const ProfileFooter = ({ 
  isEditing, 
  isLoading, 
  onEdit, 
  onCancel 
}: ProfileFooterProps) => {
  return (
    <div className="flex gap-2 justify-end">
      {isEditing ? (
        <>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            キャンセル
          </Button>
          <Button onClick={onEdit} disabled={isLoading}>
            {isLoading ? "保存中..." : "保存"}
          </Button>
        </>
      ) : (
        <Button onClick={onEdit}>
          プロフィールを編集
        </Button>
      )}
    </div>
  );
};
