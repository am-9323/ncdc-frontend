# NCDC様 フロントエンド課題

ページのタイトルと本文を作成・編集・削除できるアプリです。

## 環境構築

動作確認した環境: Node.js v26.10.0（Vite 8 の要件は `^20.19.0 || >=22.12.0`）

### 1. バックエンド API を起動する

[ncdcdev/recruit-frontend](https://github.com/ncdcdev/recruit-frontend) を clone し、README の手順で起動します（`http://localhost:3000`）。

```bash
npm install
npm run migration:run
npm run build
npm run start
```

### 2. フロントエンドを起動する

```bash
cp .env.example .env   # API の URL（既定は http://localhost:3000）
npm install
npm run dev            # http://localhost:5173
```

### コマンド

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバーを起動する |
| `npm run build` | 型チェックとビルド |
| `npm test` | テストを実行する（1 回だけ実行する場合は `npm test -- --run`） |
| `npm run lint` | oxlint で静的解析する |
| `npm run format:check` | Prettier で整形を確認する |

## 技術スタック

選定理由の詳細は各 ADR に記載しています。

| 分類 | 技術 | 理由 | ADR |
| --- | --- | --- | --- |
| 基本構成 | React + TypeScript + Vite | 経験があり、期限内に仕様を満たせる。仕様に対して十分な構成 | 001 |
| スタイリング | CSS Modules + Sass（SCSS） | スタイルを tsx から分離できる。デザインの指定値をそのまま書ける。Sass は切り替え幅の共通化のみに使用 | 002、013 |
| ルーティング | React Router | 事実上の標準で、要件に対して十分 | 003 |
| データ取得 | TanStack Query + fetch | 読み込み中・エラー・再取得を簡潔に書ける。API 数が少なく fetch で十分 | 004 |
| テスト | Vitest + Testing Library + MSW | Jest とほぼ同じ API で、Vite の設定を共有できる。MSW は URL とメソッドごとに API のモックを書ける | 005、015 |

## 設計

- **ディレクトリ構成:** [bulletproof-react](https://github.com/alan2207/bulletproof-react) を簡略化した機能単位の構成です（ADR 006）。依存は `共通（components / lib / styles）→ features → app` の一方向にしています。

  ```
  src/
  ├── app/          # ルーティングと画面（features を組み合わせるだけの薄い層）
  ├── features/
  │   └── content/  # ページ機能（api / components / utils / types）
  ├── components/   # 業務知識を持たない共通 UI（Button、IconButton、Spinner、AppLayout）
  ├── config/       # URL の定義
  ├── lib/          # fetch のラッパー
  ├── styles/       # デザイントークン、グローバルスタイル、Sass 変数
  └── test/         # テスト用の共通コード（API のモック、テストデータ、Provider 付きの描画）
  ```

- **コンポーネント:** 共通コンポーネントは props を必要なものに絞り、呼び出し側から見た目を崩せないようにしています（ADR 009）。
- **データ取得:** API ごとに取得関数と hooks を `features/content/api/` に置き、Query のキーは `content-keys.ts` にまとめています（ADR 010）。
- **バリデーション:** ライブラリは使わず、文字数を判定する関数を自前で用意しています（ADR 011）。
- **コーディング規約:** import は `@/` からの絶対パス（ADR 007）、コンポーネントは `export default function`、それ以外は named export のアロー関数（ADR 008）です。ファイル名は、コンポーネントをパスカルケース、ルート・関数などをケバブケースにしています（ADR 014）。複数のクラスの指定には `clsx` を使います（ADR 018）。

## テスト

コンポーネントのテストは、利用者の操作（クリック・入力）と画面の結果を確認する形で書いています。API は MSW でモックし（`src/test/mocks/`）、hooks や API 関数の実装には依存しないようにしています。テストでは `.env.test` の API の URL を使うため、`.env` がなくても実行できます。

| 対象 | 主な内容 |
| --- | --- |
| 結合テスト（`src/app/app.test.tsx`、`content.test.tsx`） | URL ごとの表示（`/`、`/content/:id`、存在しない ID、定義のないパス、0 件）、ページの選択、保存したタイトルのサイドバーへの反映、作成、削除後の移動 |
| サイドバー（`ContentNav`、`ContentList`） | 一覧表示、編集モード、作成、削除、確認ダイアログ、失敗時の表示 |
| メインエリア（`ContentDetail`、`ContentField`、`ContentHome`） | 表示、編集・保存・Cancel、バリデーション、存在しないページ、0 件の表示 |
| バリデーション（`validate-content-field`） | 文字数の境界値、空白だけのタイトル、絵文字・改行の数え方 |
| 共通部品（`Button`、`IconButton`、`Spinner`、`AppLayout`）、`api-client` | クリック、disabled、ドロワーの開閉、エラー時の例外 |

## 仕様の指定がない部分

課題・デザインで指定がない部分は、次のように実装しています。

### ページの作成・削除

- 作成時は、バリデーションを満たす初期値（タイトル「無題のページ」、本文「本文を入力してください。」）で作成します。
- 作成後は、作成したページへ移動し、タイトルを編集状態で開きます。
- 削除の前に確認ダイアログを表示します。
- 表示中のページを削除した場合は、次のページ（末尾なら前のページ）へ移動します。

### 編集・バリデーション

- タイトルと本文は、それぞれ独立して編集・保存できます。
- Cancel で入力を破棄し、保存済みの値に戻します。
- 保存に失敗した場合は、編集状態のままメッセージを表示し、入力を残します。
- 文字数は、絵文字を 1 文字、改行も 1 文字として数えます。タイトルは空白だけでは保存できません。
- Save 時に条件を満たさない場合は保存せず、入力欄の枠とメッセージを赤で表示します。
- 条件を満たさない既存データも、表示はそのまま行います。

### 表示

- 選択中のページを URL（`/content/:id`）に反映し、リロードや共有で同じページを開けます。
- トップ（`/`）では先頭のページを表示します。存在しない ID の URL では「ページが見つかりません」を表示します。
- サイドバーは作成順（ID の昇順）に並べ、長いタイトルは省略して、ホバーで全文を表示します。
- タイトルが空の場合は「無題」と表示し、本文の改行はそのまま表示します。
- 読み込み中はスピナー、取得失敗時はメッセージを表示し、通信中は作成・削除・保存のボタンを押せなくします。

### レスポンシブ対応

- 1024px 未満（SP・タブレット縦画面）では、サイドバーをヘッダーのメニューボタンから開くドロワーにします。
- メニューと閉じるのアイコンはデザインの素材にないため、自作しています（`src/assets/icons/menu.svg`、`close.svg`）。

## 中間文書

| 文書 | パス |
| --- | --- |
| ADR（設計判断の記録） | [`docs/adr/`](./docs/adr/README.md) |
