# 点字学習・変換アプリケーション（日本語向け）

[![Release](https://github.com/masapico/tenji/actions/workflows/release.yml/badge.svg)](https://github.com/masapico/tenji/actions/workflows/release.yml)
[![GitHub Release](https://img.shields.io/github/v/release/masapico/tenji)](https://github.com/masapico/tenji/releases)

[点字 - Tenji](https://masapico.github.io/tenji/)

これは、点字を学び、使い、理解するためのWebアプリケーションです。点字学習の初心者から、点字翻訳や作成の補助ツールを求める方まで、幅広いユーザーにとって点字とかかわりやすい環境を提供します。

---

## 主な特徴

* **点字からテキストへの変換（点字 → ひらがな モード）:**
  * 6点点字（凸面）の各ドットを視覚的・直感的に操作。
  * 濁点・半濁点・拗音などの2マス組み合わせもリアルタイムで認識・判定します。
  * 行やマスの動的な追加・削除が可能です。
* **テキストから点字への変換（ひらがな → 点字 モード）:**
  * ひらがなを入力するだけで、瞬時に対応する点字マス列を生成します。
* **点字五十音表・文字一覧（文字一覧 モード）:**
  * 五十音（清音）、濁音・半濁音、拗音、特殊音・外来音、記号を体系的に一覧表示。
  * 母音（1・2・4の点）に各行の子音点が加算される点字の構造的規則性を可視化。
  * リアルタイム検索（インクリメンタルサーチ）およびカテゴリ別絞り込みに対応。
  * 初心者向けの点番号（1〜6）バッジ表示切替や、文字をクリックしての詳細確認・点字入力モードへの転送連携が可能。
* **印刷対応:**
  * ブラウザの印刷機能（Ctrl+P / Cmd+P）で、操作ボタン類を除いた点字マスや五十音一覧表を学習プリントのように綺麗に出力できます。

* **ビルド不要（No-build）構成:**
  * Node.js やバンドラー（Vite, Webpack等）のビルド工程が一切不要です。
  * ブラウザ標準の Web技術（HTML5 / ES Modules / CSS3）のみで完結しており、ファイルを直接ブラウザで開くか、GitHub Pages などの静的Webサーバーに配置するだけで即座に動作します。
* **デジタル庁デザインシステム準拠:**
  * 行政・公共サイトで求められる高いアクセシビリティ（JIS X 8341-3 / WCAG 2.1 AA準拠）を取り入れたデザイン。
  * 高コントラスト比（7:1以上）、明瞭なフォーカスリング、キーボード操作（Tab移動、Space/Enterキーによるドットのオン/オフ切替）に対応しています。
---

## ディレクトリ構成

```text
tenji/
├── .github/
│   └── workflows/
│       └── release.yml   # タグプッシュ時 Release 自動作成アクション
├── index.html            # メインアプリケーション（GitHub Pages 公開ルート）
├── css/
│   ├── dads.css          # デジタル庁デザインシステム（トークン、ボタン、タブ、入力欄等）
│   └── tenji.css         # 点字マス、ドットボタン、文字一覧表、印刷用スタイル
├── js/
│   ├── tenji-core.js     # 点字相互変換コアアルゴリズム（ES Modules）
│   ├── tenji-data.js     # 点字五十音表・文字データおよび構造定義
│   └── app.js            # UI制御・DOMイベント・状態管理
├── tenjimap.json         # 点字定義データ（CC BY 4.0）
└── tenji.svg             # アプリアイコン
```

---

## 使い方・開発方法

ビルド工程やパッケージのインストールは不要です。

### 1. ブラウザで直接開く場合
リポジトリ内の `index.html` を任意のモダンブラウザ（Chrome, Edge, Firefox, Safari等）でダブルクリックして開くだけで利用可能です。
※ ES Modules をローカルで読み込むセキュリティ制限（CORS）を回避するため、ローカルWebサーバーの利用を推奨します。

### 2. Webサーバーに配置する場合
そのままWebサーバーに格納し、index.html へアクセスすると利用できます。

---

## 点字データの公開

アプリケーションで使用している点字データを公開しています。

* [tenjimap.json](https://masapico.github.io/tenji/tenjimap.json)
  * 「、」「。」「？」については、他の点字との組合せを優先し、このデータでは定義していません。
  * 数字とアルファベットも定義していません。
  * データは凸面を基準に作成しており、「あ」は `"100000"`、「き」は `"110001"` の形で定義しています。
  * [tenjimap.json](https://masapico.github.io/tenji/tenjimap.json) は「[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.ja)」として扱いますので、ご自由に利用してください。

---

## ライセンス

* ソースコード: [MIT License](LICENSE)
* 点字データ: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.ja)
