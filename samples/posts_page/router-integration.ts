// src/App.tsx の Routes セクションに以下を追加

<Route path="/posts" element={<AllPostsPage />} />

// src/main.tsx または適切な場所でコンポーネントをインポート
import AllPostsPage from "./pages/AllPostsPage";

// Navbar.tsx などのナビゲーションコンポーネントにリンクを追加
<Link to="/posts" className="flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-md">
  <FileText className="h-4 w-4" />
  <span>すべての投稿</span>
</Link>
