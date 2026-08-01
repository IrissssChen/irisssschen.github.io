# 言の葉 (Kotonoha) — 日本語漢字パズル

テーマやウェブページから単語帳をつくり、音をつなぐ漢字パズルで学べる日本語学習アプリ。

## アーキテクチャ

```
ブラウザ (app.js)
    │
    │ fetch("/api/extract", { url, html? })
    ▼
self-host/server.mjs  ──►  worker.js (Cloudflare Workers 互換)
    │                           │
    │ SQLite (node:sqlite)      │ lookupWord()
    │                           │   ├─ ローカル辞書 (__kotonohaDict)
    ▼                           │   ├─ Jisho API (フォールバック)
  SQLite                        │   └─ Free Dictionary API
  ├─ users, sessions, saves    │ extractWordsFromText()
  └─ words (辞書テーブル)       │   ├─ visibleTextFromHtml()
                                │   ├─ collectCandidates()
                                │   └─ enrichChineseMeanings()
                                ▼
                            JSON レスポンス
```

## URL から単語を抽出する流れ

### バックエンド (`worker.js`)

1. **`POST /api/extract`** — リクエストを受け取る
2. `body.url` が指定されていれば `fetchHtml(url)` で HTML を取得
   - `body.html` があればサーバー fetch をスキップ（ブラウザ側で取得済み）
3. **`visibleTextFromHtml(html)`** — HTML → プレーンテキスト
4. **`collectCandidates(text)`** — `Intl.Segmenter("ja")` で分かち書き
   - 漢字を含む、2〜18 文字のトークンのみ抽出
5. **`lookupWord(candidate)`** — 各トークンを辞書検索
   - ① `__kotonohaDict`（SQLite words テーブルから起動時に構築）
   - ② Jisho.org API
   - ③ Free Dictionary API
6. **`enrichChineseMeanings(words)`** — 中国語訳を付与
7. 結果を JSON で返す

### フロントエンド (`app.js`)

1. ユーザーが URL を入力
2. **3 段階 fetch 戦略**（CORS 回避のため）:
   - ① `/api/fetch` サーバープロキシ（同一オリジン、国内サイト向け）
   - ② `corsproxy.io`（海外サイト向け）
   - ③ 直接 `fetch(url)`（CORS 対応サイト向け）
3. 取得した HTML を `POST /api/extract { url, html }` で送信
4. サーバーは HTML を受け取り、抽出パイプラインを実行

## 辞書（words テーブル）

SQLite の `words` テーブルに単語データを保存:

| カラム | 説明 |
|---|---|
| `reading` | 読みがな（例: `りょこう`） |
| `surface` | 表記（例: `旅行`） |
| `meaning` | 中国語訳（例: `旅行・旅程`） |
| `level` | JLPT レベル（1-5） |
| `pos` | 品詞 |

起動時に `buildKotonohaDict()` がこのテーブルから双方向 Map を構築:
- `reading → entry`
- `surface → entry`（漢字表記でも引ける）

## Self-Host デプロイ

### 要件
- Node.js >= 22.13（`node:sqlite` が必要）
- Nginx（HTTPS 終端 + リバースプロキシ）

### 起動

```bash
npm run build   # 初回のみ（またはビルド済みファイルを使う）
node self-host/server.mjs
```

デフォルト: `127.0.0.1:3000`、データベースは `data/kotonoha.sqlite`

### systemd サービス

```bash
cp deploy/kotonoha.service /etc/systemd/system/
systemctl enable --now kotonoha
```

### Nginx 設定

```nginx
# deploy/jp.soyorin-love.xyz.conf を参照
# 重要な設定:
#   proxy_set_header X-Forwarded-Proto https;
#   proxy_set_header Host $host;
```

### デプロイ先

`https://jp.soyorin-love.xyz` — 阿里雲 ECS (中国・ウランチャブ) + Cloudflare プロキシ

## 既知の制限

| 問題 | 対策 |
|---|---|
| ECS から海外サイトにアクセス不可（GFW） | ブラウザ側 fetch + corsproxy.io フォールバック |
| CORS によるブラウザ直接 fetch のブロック | `/api/fetch` サーバープロキシ + corsproxy.io |
| Jisho API のレート制限・不安定さ | ローカル辞書（words テーブル）を優先 |
| PDF インポート（pdf.js） | ブラウザ側でレンダリング、テキスト抽出は `/api/extract-text` |

## ディレクトリ構成

```
kotonoha/
├── index.html          # エントリポイント
├── app.js              # フロントエンド SPA
├── app.css             # スタイル
├── worker.js           # バックエンド (Cloudflare Workers 互換)
├── worker/index.js     # worker.js のビルド前ソース
├── self-host/
│   ├── server.mjs      # Node.js 自托管サーバー
│   └── README.md
├── vendor/             # pdf.js (漢字レンダリング用)
├── deploy/
│   ├── jp.soyorin-love.xyz.conf  # Nginx HTTPS 設定
│   └── kotonoha.service          # systemd ユニット
└── data/
    └── kotonoha.sqlite  # SQLite データベース（gitignore）
```

## ライセンス

このプロジェクトは [IrissssChen/irisssschen.github.io](https://github.com/IrissssChen/irisssschen.github.io) の一部です。
