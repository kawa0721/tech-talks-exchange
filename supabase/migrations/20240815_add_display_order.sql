-- channels テーブルに display_order カラムを追加
ALTER TABLE channels
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- channel_categories テーブルに display_order カラムを追加
ALTER TABLE channel_categories
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- コメントを追加
COMMENT ON COLUMN channels.display_order IS 'チャンネルの表示順序';
COMMENT ON COLUMN channel_categories.display_order IS 'カテゴリーの表示順序'; 