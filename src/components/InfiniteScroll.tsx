import { useEffect, useRef, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface InfiniteScrollProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  loadingComponent?: ReactNode;
  loadingTextComponent?: ReactNode;
  endTextComponent?: ReactNode;
  threshold?: number;
  children: ReactNode;
}

const InfiniteScroll = ({
  onLoadMore,
  hasMore,
  isLoading,
  loadingComponent,
  loadingTextComponent,
  endTextComponent,
  threshold = 200, // デフォルトのスクロールしきい値（ピクセル）
  children,
}: InfiniteScrollProps) => {
  const loadingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // 監視対象が表示領域に入った時
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      {
        // rootMargin: スクロール位置に到達する前に読み込みを開始する距離
        rootMargin: `0px 0px ${threshold}px 0px`,
      }
    );

    // 監視対象の要素を登録
    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    // クリーンアップ関数
    return () => {
      if (loadingRef.current) {
        observer.unobserve(loadingRef.current);
      }
    };
  }, [hasMore, isLoading, onLoadMore, threshold]);

  return (
    <div className="infinite-scroll-component">
      {children}
      
      {/* ローディングエリア（監視対象） */}
      <div ref={loadingRef} className="loading-area py-4 mt-2">
        {isLoading && (
          loadingComponent || (
            <div className="flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin" />
              {loadingTextComponent}
            </div>
          )
        )}
        
        {/* すべてのデータが読み込まれた時のメッセージ */}
        {!hasMore && !isLoading && (
          endTextComponent || (
            <div className="text-center py-4 text-sm text-muted-foreground">
              すべてのコンテンツを表示しています
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default InfiniteScroll;