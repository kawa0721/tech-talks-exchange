/// <reference types="vite/client" />

// コメント深いネスト対応のためのグローバル変数宣言
interface Window {
  replyTo: string | null;
  submitNestedReply: ((parentId: string, content: string, nickname?: string) => void) | null;
  currentUser: any | null; // ユーザー認証情報を格納
  __APP_CONTEXT__?: {
    user: any | null;
    [key: string]: any;
  };
}
