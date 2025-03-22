-- インデックスの追加（検索パフォーマンス向上のため）

-- いいね数のインデックス
CREATE INDEX IF NOT EXISTS idx_posts_likes_count ON posts(likes_count DESC);

-- コメント数のインデックス
CREATE INDEX IF NOT EXISTS idx_posts_comments_count ON posts(comments_count DESC);

-- 作成日時のインデックス
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- チャンネルIDと作成日時の複合インデックス
CREATE INDEX IF NOT EXISTS idx_posts_channel_created ON posts(channel_id, created_at DESC);

-- コンテンツタイプのインデックス（適宜調整）
-- 画像を含む投稿の検索を高速化
CREATE INDEX IF NOT EXISTS idx_posts_has_images ON posts((images IS NOT NULL));

-- トレンド情報の計算のためのビュー
CREATE OR REPLACE VIEW trending_posts AS
SELECT 
  p.*,
  -- トレンドスコアの計算（直近のいいねや閲覧に重み付け）
  (
    p.likes_count * 3 +
    p.comments_count * 5 +
    GREATEST(1, 14 - EXTRACT(DAY FROM (NOW() - p.created_at)))^2 
  ) AS trending_score,
  -- エンゲージメントスコア
  CASE
    WHEN p.views_count > 0 THEN 
      ((p.likes_count + p.comments_count) * 100.0) / p.views_count
    ELSE 0
  END AS engagement_score,
  -- 概算コンテンツ長
  LENGTH(p.content) AS content_length,
  -- メディア豊かさスコア
  CASE
    WHEN p.images IS NOT NULL THEN
      JSONB_ARRAY_LENGTH(p.images)
    ELSE 0
  END AS media_count
FROM posts p;

-- 保存した投稿用テーブル
CREATE TABLE IF NOT EXISTS saved_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- インタラクション用のテーブル
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- ユーザーインタラクション集計用のRLS ポリシー
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ユーザーは自分のいいねを確認できる" ON post_likes
  FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ユーザーは自分の保存した投稿を確認できる" ON saved_posts
  FOR SELECT USING (auth.uid() = user_id);

-- 必要に応じてデータ型を追加・更新
ALTER TABLE posts ADD COLUMN IF NOT EXISTS views_count INT DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_official BOOLEAN DEFAULT FALSE;
