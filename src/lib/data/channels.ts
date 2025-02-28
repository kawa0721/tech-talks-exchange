
import { Channel, ChannelCategory } from "@/types";

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
    id: 'others',
    name: 'その他',
    channels: ['general']
  },
  // カテゴリーは残しておきます（表示されなくなりますが既存データ参照用）
  {
    id: 'programming-languages-frameworks',
    name: 'プログラミング言語/フレームワーク',
    channels: ['react', 'typescript']
  }
];
