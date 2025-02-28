
import { Comment } from "@/types";

export const COMMENTS: Comment[] = [
  {
    id: 'comment-1',
    postId: 'post-1',
    userId: 'user-2',
    user: {
      id: 'user-2',
      name: '山田 花子',
      avatar: 'https://i.pravatar.cc/150?img=2'
    },
    content: 'この記事とても参考になりました！特にPrettierとGitLensは私も愛用しています。',
    createdAt: new Date('2024-04-28T14:30:00Z'),
    likesCount: 5,
    liked: false
  },
  {
    id: 'comment-2',
    postId: 'post-1',
    userId: 'user-3',
    user: {
      id: 'user-3',
      name: '佐藤 次郎',
      avatar: 'https://i.pravatar.cc/150?img=3'
    },
    content: 'vscode-iconsの代わりにMaterial Icon Themeも良いですよ！',
    createdAt: new Date('2024-04-28T15:45:00Z'),
    likesCount: 3,
    liked: true
  },
  {
    id: 'comment-3',
    postId: 'post-2',
    userId: 'user-4',
    user: {
      id: 'user-4',
      name: '鈴木 さくら',
      avatar: 'https://i.pravatar.cc/150?img=4'
    },
    content: 'useEffectの使い方がよく分かりました。依存配列の重要性について、もう少し詳しく説明していただけませんか？',
    createdAt: new Date('2024-04-27T19:20:00Z'),
    likesCount: 2,
    liked: false
  },
  {
    id: 'comment-4',
    postId: 'post-2',
    userId: 'user-1',
    user: {
      id: 'user-1',
      name: '田中 太郎',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    content: 'useCallbackとuseMemoの違いについても知りたいです。',
    createdAt: new Date('2024-04-27T20:10:00Z'),
    likesCount: 1,
    liked: false
  }
];
