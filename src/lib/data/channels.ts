
import { Channel, ChannelCategory } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// チャンネルデータをSupabaseから取得する関数
export const getChannels = async (): Promise<Channel[]> => {
  try {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('name');
      
    if (error) {
      console.error("チャンネル取得エラー:", error);
      return CHANNELS; // エラー時はダミーデータを返す
    }
    
    return data.map(channel => ({
      id: channel.id,
      name: channel.name,
      description: channel.description,
      icon: channel.icon,
      categoryId: channel.category_id
    }));
  } catch (error) {
    console.error("チャンネル取得エラー:", error);
    return CHANNELS; // エラー時はダミーデータを返す
  }
};

// カテゴリーデータをSupabaseから取得する関数
export const getChannelCategories = async (): Promise<ChannelCategory[]> => {
  try {
    // まずカテゴリーを取得
    const { data: categories, error: categoryError } = await supabase
      .from('channel_categories')
      .select('*')
      .order('name');
      
    if (categoryError) {
      console.error("カテゴリー取得エラー:", categoryError);
      return CHANNEL_CATEGORIES; // エラー時はダミーデータを返す
    }
    
    // 次にチャンネルを取得
    const { data: channels, error: channelError } = await supabase
      .from('channels')
      .select('*');
      
    if (channelError) {
      console.error("チャンネル取得エラー:", channelError);
      return CHANNEL_CATEGORIES; // エラー時はダミーデータを返す
    }
    
    // カテゴリーごとにチャンネルをグループ化
    return categories.map(category => {
      const categoryChannels = channels
        .filter(channel => channel.category_id === category.id)
        .map(channel => channel.id);
        
      return {
        id: category.id,
        name: category.name,
        channels: categoryChannels
      };
    });
  } catch (error) {
    console.error("カテゴリー取得エラー:", error);
    return CHANNEL_CATEGORIES; // エラー時はダミーデータを返す
  }
};

// ダミーデータ（互換性のために残しておく）
export const CHANNELS: Channel[] = [
  // エディター
  {
    id: 'cursor',
    name: 'Cursor',
    description: 'Cursorエディターに関するディスカッション',
    icon: '🖱️',
    categoryId: 'editors'
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    description: 'Windsurfエディターに関するディスカッション',
    icon: '🏄',
    categoryId: 'editors'
  },
  {
    id: 'vscode',
    name: 'VSCode',
    description: 'Visual Studio Codeに関するディスカッション',
    icon: '💻',
    categoryId: 'editors'
  },
  {
    id: 'void-editor',
    name: 'Void Editor',
    description: 'Void Editorに関するディスカッション',
    icon: '⚫',
    categoryId: 'editors'
  },
  {
    id: 'intellij-pycharm',
    name: 'IntelliJ/PyCharm',
    description: 'IntelliJ IDEAとPyCharmに関するディスカッション',
    icon: '🧠',
    categoryId: 'editors'
  },

  // AIコーディングサービス
  {
    id: 'v0',
    name: 'v0',
    description: 'v0に関するディスカッション',
    icon: '🚀',
    categoryId: 'ai-coding-services'
  },
  {
    id: 'bolt-new',
    name: 'Bolt.new',
    description: 'Bolt.newに関するディスカッション',
    icon: '⚡',
    categoryId: 'ai-coding-services'
  },
  {
    id: 'lovable',
    name: 'Lovable',
    description: 'Lovableに関するディスカッション',
    icon: '❤️',
    categoryId: 'ai-coding-services'
  },
  {
    id: 'replit',
    name: 'Replit',
    description: 'Replitに関するディスカッション',
    icon: '🔄',
    categoryId: 'ai-coding-services'
  },
  {
    id: 'devin',
    name: 'Devin',
    description: 'Devinに関するディスカッション',
    icon: '🤖',
    categoryId: 'ai-coding-services'
  },

  // エディター拡張機能
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    description: 'GitHub Copilotに関するディスカッション',
    icon: '👨‍💻',
    categoryId: 'editor-extensions'
  },
  {
    id: 'cline',
    name: 'Cline',
    description: 'Clineに関するディスカッション',
    icon: '📊',
    categoryId: 'editor-extensions'
  },
  {
    id: 'roo-cline',
    name: 'Roo Cline',
    description: 'Roo Clineに関するディスカッション',
    icon: '🦘',
    categoryId: 'editor-extensions'
  },
  {
    id: 'julie',
    name: 'Julie',
    description: 'Julie AIに関するディスカッション',
    icon: '🤖',
    categoryId: 'editor-extensions'
  },

  // その他
  {
    id: 'general',
    name: '一般',
    description: '一般的なトピックに関するディスカッション',
    icon: '💬',
    categoryId: 'others'
  },

  // 以下は表示されなくなりますが、既存のデータ参照のために残しておきます
  {
    id: 'react',
    name: 'React',
    description: 'Reactに関するディスカッション',
    icon: '⚛️',
    categoryId: 'programming-languages-frameworks'
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    description: 'TypeScriptに関するディスカッション',
    icon: '📘',
    categoryId: 'programming-languages-frameworks'
  }
];

export const CHANNEL_CATEGORIES: ChannelCategory[] = [
  {
    id: 'editors',
    name: 'エディター',
    channels: ['cursor', 'windsurf', 'vscode', 'void-editor', 'intellij-pycharm']
  },
  {
    id: 'ai-coding-services',
    name: 'AIコーディングサービス',
    channels: ['v0', 'bolt-new', 'lovable', 'replit', 'devin']
  },
  {
    id: 'editor-extensions',
    name: 'エディター拡張機能',
    channels: ['github-copilot', 'cline', 'roo-cline', 'julie']
  },
  {
    id: 'programming-languages-frameworks',
    name: 'プログラミング言語/フレームワーク',
    channels: ['react', 'typescript']
  },
  {
    id: 'others',
    name: 'その他',
    channels: ['general']
  }
];
