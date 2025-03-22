// src/types/filters.ts

// 全ての投稿ページの並び替え用オプション
export type SortOption = 
  | "latest"        // 新着順
  | "oldest"        // 古い順
  | "trending"      // トレンド（最近の人気の上昇率）
  | "popular"       // 人気順（いいね数）
  | "mostComments"  // コメント数順
  | "engagement"    // エンゲージメント率
  | "recentlyActive" // 最近のアクティビティ（コメントや更新）
  | "contentLength" // 内容の長さ順
  | "mediaRich";    // メディア量順

// フィルターオプションの定義
export interface FilterOptions {
  // チャンネルフィルター（複数選択可能）
  channels: string[];
  
  // 時間範囲フィルター
  timeRange: "all" | "today" | "week" | "month" | "threemonths" | "year" | "custom";
  
  // 公式/非公式投稿フィルター
  official?: boolean;
  
  // いいね数最小値
  minLikes: number;
  
  // コメント数最小値
  minComments: number;
  
  // メディア（画像など）を含む投稿のみ
  hasMedia?: boolean;
  
  // コードブロックを含む投稿のみ
  hasCode?: boolean;
  
  // 特定のユーザーによる投稿のみ
  createdBy?: string;
  
  // ユーザーインタラクション（いいね済み、コメント済み、保存済み）
  interactionType?: "liked" | "commented" | "saved";
  
  // キーワード検索
  keywords: string;
  
  // カスタム日付範囲（timeRangeがcustomの場合のみ使用）
  dateStart?: string;
  dateEnd?: string;
}

// フィルタータグの型
export interface FilterTagProps {
  label: string;
  onRemove: () => void;
}

// フィルターコンポーネントのprops
export interface PostsFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  channelOptions: Array<{ id: string; name: string; description: string }>;
}

// 並び替えコンポーネントのprops
export interface PostsSortingProps {
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
}

// フィルタリング済み投稿用カスタムフックの引数
export interface UseFilteredPostsOptions {
  filters: FilterOptions;
  sortOption: SortOption;
  perPage: number;
} 