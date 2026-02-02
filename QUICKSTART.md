# クイックスタートガイド

## 起動方法

ターミナルを開いて、以下のコマンドを実行してください：

```bash
cd /Users/hyakuzukamaya/Desktop/diagram
docker-compose up --build
```

## アクセス方法

起動後、ブラウザで以下のURLにアクセスしてください：

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:3001

## 停止方法

ターミナルで `Ctrl + C` を押してください。

コンテナを完全に削除する場合：
```bash
docker-compose down
```

## 開発モード（Dockerを使わない場合）

### バックエンド起動
```bash
cd backend
npm install
npm start
```

### フロントエンド起動（別のターミナルで）
```bash
cd frontend
npm install
npm start
```

## 初回セットアップ時の注意

初回起動時は、依存パッケージのインストールに時間がかかる場合があります。
しばらくお待ちください。

## トラブルシューティング

### ポートエラーが出る場合
すでにポート3000または3001が使用されている可能性があります。
該当するプロセスを終了してから再度起動してください。

### Dockerのエラー
```bash
# Dockerコンテナとボリュームをクリーンアップ
docker-compose down -v

# 再ビルドして起動
docker-compose up --build
```
