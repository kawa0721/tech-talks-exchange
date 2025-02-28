
export type User = {
  id: string;
  name: string;
  avatar?: string;
  profile?: string;
};

export type ChannelCategory = {
  id: string;
  name: string;
  channels: string[]; // channels配列を追加
};

export type Channel = {
  id: string;
  name: string;
  description: string;
  icon?: string;
  categoryId: string;
};

export type Comment = {
  id: string;
  postId: string;
  userId: string;
  user: User;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  parentId?: string;
  replies?: Comment[];
  likesCount: number;
  liked?: boolean;
  isEditing?: boolean;
};

export type Post = {
  id: string;
  title: string;
  content: string;
  userId: string;
  user: User;
  channelId: string;
  createdAt: Date;
  updatedAt?: Date;
  commentsCount: number;
  likesCount: number;
  liked?: boolean;
  images?: string[];
};
