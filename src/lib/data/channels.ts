
import { Channel, ChannelCategory } from "@/types";

export const CHANNELS: Channel[] = [
  {
    id: 'vscode',
    name: 'VSCode',
    description: 'Visual Studio Codeに関するディスカッション',
    icon: '💻',
    categoryId: 'editors'
  },
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
  },
  {
    id: 'intellij',
    name: 'IntelliJ IDEA',
    description: 'IntelliJ IDEAに関するディスカッション',
    icon: '🧠',
    categoryId: 'editors'
  },
  {
    id: 'vim',
    name: 'Vim',
    description: 'Vimに関するディスカッション',
    icon: '📝',
    categoryId: 'editors'
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    description: 'GitHub Copilotに関するディスカッション',
    icon: '🤖',
    categoryId: 'editor-extensions'
  },
  {
    id: 'amazon-codewhisperer',
    name: 'Amazon CodeWhisperer',
    description: 'Amazon CodeWhispererに関するディスカッション',
    icon: '☁️',
    categoryId: 'ai-coding-services'
  },
  {
    id: 'codeium',
    name: 'Codeium',
    description: 'Codeiumに関するディスカッション',
    icon: '🧩',
    categoryId: 'ai-coding-services'
  },
  {
    id: 'tabnine',
    name: 'Tabnine',
    description: 'Tabnineに関するディスカッション',
    icon: '📊',
    categoryId: 'editor-extensions'
  },
  {
    id: 'kite',
    name: 'Kite',
    description: 'Kiteに関するディスカッション',
    icon: '🪁',
    categoryId: 'editor-extensions'
  },
  {
    id: 'blackbox',
    name: 'Blackbox',
    description: 'Blackboxに関するディスカッション',
    icon: '📦',
    categoryId: 'editor-extensions'
  },
  {
    id: 'julie',
    name: 'Julie',
    description: 'Julie AIに関するディスカッション',
    icon: '🤖',
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
    id: 'general',
    name: '一般',
    description: '一般的なトピックに関するディスカッション',
    icon: '💬',
    categoryId: 'others'
  },
  {
    id: 'qna',
    name: '質問と回答',
    description: '質問と回答に関するディスカッション',
    icon: '❓',
    categoryId: 'others'
  },
];

export const CHANNEL_CATEGORIES: ChannelCategory[] = [
  {
    id: 'programming-languages-frameworks',
    name: 'プログラミング言語/フレームワーク',
    channels: ['react', 'typescript']
  },
  {
    id: 'editors',
    name: 'エディター',
    channels: ['vscode', 'intellij', 'vim']
  },
  {
    id: 'ai-coding-services',
    name: 'AIコーディングサービス',
    channels: ['amazon-codewhisperer', 'codeium']
  },
  {
    id: 'editor-extensions',
    name: 'エディター拡張機能',
    channels: ['github-copilot', 'tabnine', 'kite', 'blackbox', 'julie', 'roo-cline']
  },
  {
    id: 'others',
    name: 'その他',
    channels: ['general', 'qna']
  }
];
