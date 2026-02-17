# System Diagram Visualization

## 概要
SoR (System of Record)、decoupling layer、SoE (System of Engagement) に分類される複雑なシステムアーキテクチャを可視化するWebアプリケーションです。

## 主要機能

### ✨ 新機能: 3段階の表示レベル

アプリケーションは3つの表示レベルをサポートしています：

#### 1. システムタイプ表示
- SoR、decoupling、SoEの3つのグループで表示
- 最も抽象度の高いビュー
- システム全体のアーキテクチャパターンを把握

#### 2. システム名表示
- 各システム名（JOINT、API Gateway、Customer Portalなど）でグループ化
- システム単位での依存関係を可視化
- 中程度の詳細レベル

#### 3. APIパス表示
- 個々のAPIエンドポイントごとに表示
- 最も詳細なビュー
- 具体的なAPI呼び出しフローを追跡

### 🎯 レイアウト特徴

- **固定配置**: SoR（左）、Decoupling Layer（中央）、SoE（右）に固定
- **カラーコーディング**: 各システムタイプに専用の色
- **背景エリア**: 各レイヤーを視覚的に区別

### 実装済み機能
1. ✅ ノードがAPI caller IDとAPI call target IDを元に接続されて表示
2. ✅ ノードがSystem Nameでグループ化されて表示
3. ✅ ノードがSystem Typeで左・中央・右に固定配置
4. ✅ エラーノード（isError: true）とその接続ノードをハイライト表示
5. ✅ 3段階の表示レベル切り替え（システムタイプ/システム名/APIパス）
6. ✅ インタラクティブな操作（ズーム、パン）
7. ✅ ツールチップによる詳細情報表示

## データ構造

各ノードは以下の情報を持ちます：

```javascript
{
  id: 'node1',                    // ノードの一意識別子
  systemType: 'Decoupling',              // システムタイプ: 'SoR' | 'decoupling' | 'SoE'
  systemName: 'JOINT',            // システム名
  apiPath: '/v1/ryoukin',         // APIパス
  apiCallerId: null,              // このノードを呼び出すノードのID
  apiCallTargetId: 'node2',       // このノードが呼び出すノードのID
  component: 'keiyaku button',    // コンポーネント名
  isError: false                  // エラー状態
}
```

## 技術スタック

### フロントエンド
- React 18
- D3.js (データビジュアライゼーション)
- Axios (HTTP通信)

### バックエンド
- Node.js
- Express
- CORS

### インフラ
- Docker & Docker Compose

## セットアップ

### 前提条件
- Docker Desktop がインストールされていること
- Docker Compose が利用可能であること

### 起動方法

1. プロジェクトディレクトリに移動
```bash
cd /Users/hyakuzukamaya/Desktop/diagram
```

2. Docker Composeでアプリケーションを起動
```bash
docker-compose up --build
```

3. ブラウザでアクセス
- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:3001

### 開発モード

個別にサービスを起動する場合：

#### バックエンド
```bash
cd backend
npm install
npm start
```

#### フロントエンド
```bash
cd frontend
npm install
npm start
```

## API エンドポイント

### `GET /api/nodes`
全ノードの取得

### `GET /api/nodes/:id`
特定ノードの取得

### `GET /api/error-trace`
エラーノードとその接続ノードの取得

### `POST /api/nodes`
新しいノードの追加

## 使い方

### 基本操作
- **マウスホイール**: ズームイン/ズームアウト
- **ドラッグ**: キャンバスの移動
- **ノードホバー**: 詳細情報の表示

### 表示レベル切り替え
1. ヘッダーの「システムタイプ」「システム名」「APIパス」ボタンで表示レベルを切り替え
2. 各レベルで異なる粒度の情報を確認
3. ノード数バッジで各グループに含まれるノード数を表示

### エラートレース機能
1. ヘッダーの「エラートレース表示」ボタンをクリック
2. エラーが発生しているノード（赤色）とその接続ノードのみが表示される
3. エラーの影響範囲を視覚的に確認できる

## ビジュアル説明

### 色の意味
- **緑色** (SoR): System of Record - データの信頼できる情報源
- **青色** (Decoupling): 統合レイヤー - システム間の疎結合を実現
- **オレンジ色** (SoE): System of Engagement - ユーザー向けインターフェース
- **赤色**: エラーが発生しているノード

### レイアウト
```
┌─────────────┬──────────────────┬─────────────┐
│   SoR       │   Decoupling     │    SoE      │
│   (左)      │     (中央)       │   (右)      │
├─────────────┼──────────────────┼─────────────┤
│  JOINT      │  API Gateway     │ Customer    │
│             │                  │ Portal      │
│  Legacy DB  │  Message Queue   │ Mobile App  │
│             │                  │             │
│             │                  │ Admin       │
│             │                  │ Console     │
└─────────────┴──────────────────┴─────────────┘
```

## カスタマイズ

### サンプルデータの変更
`backend/server.js` の `sampleNodes` 配列を編集してください。

### ビジュアルの調整
- ノードの色: `frontend/src/components/SystemDiagram.js` の `colorScale`
- レイアウト位置: `xPositions` オブジェクト
- スタイル: `frontend/src/components/SystemDiagram.css`

## ディレクトリ構造
```
diagram/
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js
│       ├── App.css
│       ├── index.js
│       ├── index.css
│       └── components/
│           ├── SystemDiagram.js
│           └── SystemDiagram.css
├── docker-compose.yml
├── .dockerignore
├── .gitignore
├── QUICKSTART.md
└── README.md
```

## トラブルシューティング

### ポートが既に使用されている
```bash
# 使用中のポートを確認
lsof -i :3000
lsof -i :3001

# プロセスを終了
kill -9 <PID>
```

### Dockerコンテナのリセット
```bash
docker-compose down -v
docker-compose up --build
```

### 表示が崩れる場合
- ブラウザのキャッシュをクリア
- ブラウザのウィンドウサイズを変更してみる
- ズームをリセット（Ctrl/Cmd + 0）

## 今後の拡張案

- [ ] ノードの動的追加・編集機能
- [ ] データベース連携
- [ ] エクスポート機能（PNG, SVG, JSON）
- [ ] リアルタイム更新（WebSocket）
- [ ] 検索・フィルター機能の強化
- [ ] パフォーマンスメトリクスの表示
- [ ] カスタムカラーテーマ
- [ ] アニメーション効果

## ライセンス
MIT

## サポート

問題が発生した場合は、GitHubのIssuesセクションで報告してください。
