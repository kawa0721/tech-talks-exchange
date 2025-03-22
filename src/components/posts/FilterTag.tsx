import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FilterTagProps } from "@/types/filters";

/**
 * 選択中のフィルターを表示するためのタグコンポーネント
 * 削除ボタン付きのバッジとして実装
 */
export const FilterTag = ({ label, onRemove }: FilterTagProps) => {
  return (
    <Badge 
      variant="secondary" 
      className="flex items-center gap-1 px-2 py-1"
    >
      <span>{label}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="h-4 w-4 rounded-full flex items-center justify-center hover:bg-muted focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}; 