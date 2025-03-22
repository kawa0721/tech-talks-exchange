import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown } from "lucide-react";
import { SortOption, PostsSortingProps } from "@/types/filters";

// ソートオプションの定義
const sortOptions: { value: SortOption; label: string }[] = [
  { value: "latest", label: "新着順" },
  { value: "oldest", label: "古い順" },
  { value: "trending", label: "トレンド" },
  { value: "popular", label: "人気順" },
  { value: "mostComments", label: "コメント数順" },
  { value: "engagement", label: "エンゲージメント率" },
  { value: "recentlyActive", label: "最近のアクティビティ" },
  { value: "contentLength", label: "内容の長さ順" },
  { value: "mediaRich", label: "メディア量順" },
];

const PostsSorting = ({ sortOption, onSortChange }: PostsSortingProps) => {
  // 現在選択中のソートオプションのラベルを取得
  const currentSortLabel = sortOptions.find(
    (option) => option.value === sortOption
  )?.label || "並び替え";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-1">
          {currentSortLabel}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onSortChange(option.value)}
            className="flex items-center justify-between"
          >
            <span>{option.label}</span>
            {option.value === sortOption && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PostsSorting; 