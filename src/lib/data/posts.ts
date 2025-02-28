
import { Post } from "@/types";
import { USERS } from "./users";

export const POSTS: Post[] = [
  {
    id: 'post-1',
    title: 'VSCodeの神拡張機能7選',
    content: `## VSCodeの神拡張機能7選

VSCodeをより便利にする拡張機能を紹介します。

### 1. [Dracula Official](https://marketplace.visualstudio.com/items?itemName=dracula-theme.theme-dracula)

- おすすめ度: ⭐⭐⭐⭐⭐
- 特徴: ダークテーマの決定版。目に優しい配色が特徴です。

### 2. [indent-rainbow](https://marketplace.visualstudio.com/items?itemName=oderwat.indent-rainbow)

- おすすめ度: ⭐⭐⭐⭐
- 特徴: インデントを色分けして、コードの可読性を向上させます。

### 3.  [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

- おすすめ度: ⭐⭐⭐⭐⭐
- 特徴: コードを自動整形して、一貫性のあるコーディングスタイルを保ちます。

### 4. [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

- おすすめ度: ⭐⭐⭐⭐
- 特徴: JavaScript/TypeScriptのコードをチェックして、バグやアンチパターンを検出します。

### 5. [vscode-icons](https://marketplace.visualstudio.com/items?itemName=vscode-icons-team.vscode-icons)

- おすすめ度: ⭐⭐⭐⭐⭐
- 特徴: ファイルの種類に応じてアイコンを表示して、ファイルを探しやすくします。

### 6. [GitLens — Git supercharged](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens)

- おすすめ度: ⭐⭐⭐⭐⭐
- 特徴: Gitの機能を強化して、コードの変更履歴をより詳細に表示します。

### 7. [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)

- おすすめ度: ⭐⭐⭐⭐
- 特徴: コード内のスペルミスをチェックして、typoを減らします。

これらの拡張機能を活用して、VSCodeでの開発をより快適にしましょう！
`,
    userId: 'user-1',
    user: USERS[0],
    channelId: 'vscode',
    createdAt: new Date('2024-04-28T12:00:00Z'),
    liked: true,
    likesCount: 120,
    commentsCount: 30,
  },
  {
    id: 'post-2',
    title: 'React Hooks徹底解説',
    content: `
# React Hooks徹底解説

React Hooksは、Reactコンポーネントで状態管理や副作用を扱うための機能です。

## useState

useStateは、関数コンポーネントで状態を管理するためのHookです。

\`\`\`jsx
import React, { useState } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

## useEffect

useEffectは、関数コンポーネントで副作用を扱うためのHookです。

\`\`\`jsx
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`You clicked \${count} times\`;
  }, [count]);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

## useContext

useContextは、関数コンポーネントでContextの値を利用するためのHookです。

\`\`\`jsx
import React, { useContext } from 'react';

const MyContext = React.createContext(defaultValue);

function MyComponent() {
  const value = useContext(MyContext);

  return (
    <div>
      {value}
    </div>
  );
}
\`\`\`

## その他のHooks

- useCallback
- useMemo
- useRef
- useReducer
- useImperativeHandle
- useLayoutEffect
- useDebugValue

これらのHooksを理解して、Reactコンポーネントをより効率的に開発しましょう。
`,
    userId: 'user-2',
    user: USERS[1],
    channelId: 'react',
    createdAt: new Date('2024-04-27T18:30:00Z'),
    liked: false,
    likesCount: 85,
    commentsCount: 22,
    images: [
      "https://images.unsplash.com/photo-1682685797527-99189425bb5b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    ]
  },
  {
    id: 'post-3',
    title: 'GitHub Copilot爆速入門',
    content: `
# GitHub Copilot爆速入門

GitHub Copilotは、あなたのコーディングをAIがサポートするツールです。

## GitHub Copilotとは？

GitHub Copilotは、OpenAIとGitHubが共同で開発したAIペアプログラマーです。
コーディング中にリアルタイムでコードの提案や補完を行い、開発者の生産性を向上させます。

## GitHub Copilotの始め方

1. GitHub Copilotのサブスクリプションに登録します。
2. VSCodeなどの対応エディタにGitHub Copilot拡張機能をインストールします。
3. エディタでGitHubにサインインします。
4. コーディングを開始すると、AIがコードの提案や補完を行います。

## GitHub Copilotの活用例

- コードの自動補完
- 関数やクラスの自動生成
- テストコードの自動生成
- ドキュメントの自動生成
- コードの改善提案

## GitHub Copilotの注意点

- AIの提案を鵜呑みにせず、コードの内容を理解することが重要です。
- GitHub Copilotは、まだ完璧ではありません。提案されたコードに誤りがある場合もあります。
- GitHub Copilotは、あなたのコードを学習します。プライベートなコードは、GitHub Copilotに学習させないように注意しましょう。

GitHub Copilotを使いこなして、爆速コーディングを実現しましょう！
`,
    userId: 'user-3',
    user: USERS[2],
    channelId: 'github-copilot',
    createdAt: new Date('2024-04-26T09:15:00Z'),
    liked: true,
    likesCount: 150,
    commentsCount: 45,
  },
  {
    id: 'post-4',
    title: 'Amazon CodeWhispererを使ってみた',
    content: `
# Amazon CodeWhispererを使ってみた

Amazon CodeWhispererは、AWSが提供するAIコーディングサービスです。

## Amazon CodeWhispererとは？

Amazon CodeWhispererは、AIを活用してコーディングを支援するサービスです。
コーディング中にリアルタイムでコードの提案や補完を行い、開発者の生産性を向上させます。

## Amazon CodeWhispererの始め方

1. AWSアカウントを作成します。
2. VSCodeなどの対応エディタにAmazon CodeWhisperer拡張機能をインストールします。
3. エディタでAWSにサインインします。
4. コーディングを開始すると、AIがコードの提案や補完を行います。

## Amazon CodeWhispererの活用例

- コードの自動補完
- 関数やクラスの自動生成
- テストコードの自動生成
- ドキュメントの自動生成
- コードの改善提案

## Amazon CodeWhispererの注意点

- AIの提案を鵜呑みにせず、コードの内容を理解することが重要です。
- Amazon CodeWhispererは、まだ完璧ではありません。提案されたコードに誤りがある場合もあります。
- Amazon CodeWhispererは、あなたのコードを学習します。プライベートなコードは、Amazon CodeWhispererに学習させないように注意しましょう。

Amazon CodeWhispererを使いこなして、効率的なコーディングを実現しましょう！
`,
    userId: 'user-4',
    user: USERS[3],
    channelId: 'amazon-codewhisperer',
    createdAt: new Date('2024-04-25T22:00:00Z'),
    liked: false,
    likesCount: 70,
    commentsCount: 18,
  },
  {
    id: 'post-5',
    title: 'IntelliJ IDEAの便利なショートカット',
    content: `
# IntelliJ IDEAの便利なショートカット

IntelliJ IDEAは、Java開発でよく使われるIDE（統合開発環境）です。
ショートカットキーを使いこなすことで、開発効率を大幅に向上させることができます。

## 基本的なショートカット

- Ctrl + Space: コード補完
- Ctrl + Shift + Space: スマートコード補完
- Ctrl + N: クラスの検索
- Ctrl + Shift + N: ファイルの検索
- Ctrl + B: 定義へ移動
- Ctrl + Alt + B: 実装へ移動
- Ctrl + F: 検索
- Ctrl + R: 置換
- Ctrl + Shift + F: プロジェクト内検索
- Ctrl + Shift + R: プロジェクト内置換

## 編集に関するショートカット

- Ctrl + D: 行の複製
- Ctrl + Y: 行の削除
- Ctrl + Shift + J: 行の結合
- Ctrl + Alt + L: コードの整形
- Ctrl + /: 行コメント
- Ctrl + Shift + /: ブロックコメント

## ナビゲーションに関するショートカット

- Alt + Left: 前の編集箇所へ移動
- Alt + Right: 次の編集箇所へ移動
- Ctrl + E: 最近使用したファイル
- Ctrl + Shift + E: 最近編集したファイル

## リファクタリングに関するショートカット

- Shift + F6: 名前の変更
- Ctrl + Alt + M: メソッドの抽出
- Ctrl + Alt + V: 変数の抽出
- Ctrl + Alt + F: フィールドの抽出
- Ctrl + Alt + C: 定数の抽出

これらのショートカットキーを覚えて、IntelliJ IDEAでの開発をよりスムーズにしましょう。
`,
    userId: 'user-5',
    user: USERS[4],
    channelId: 'intellij',
    createdAt: new Date('2024-04-24T15:45:00Z'),
    liked: true,
    likesCount: 95,
    commentsCount: 25,
  },
];

export const TRENDING_POSTS = POSTS.slice(0, 3);
export const POPULAR_POSTS = POSTS.slice(2, 5);
