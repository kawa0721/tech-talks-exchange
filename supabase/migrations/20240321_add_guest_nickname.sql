-- Add guest_nickname column to posts table
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS guest_nickname TEXT;

-- Add comment
COMMENT ON COLUMN posts.guest_nickname IS 'ゲストユーザーのニックネーム'; 