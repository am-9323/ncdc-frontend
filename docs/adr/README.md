# Architecture Decision Records

本プロジェクトの設計判断を記録する。新規作成時は [000-template.md](./000-template.md) をコピーして連番で作成する。

| No. | タイトル | ステータス |
| --- | --- | --- |
| [001](./001-tech-stack.md) | フロントエンドの技術スタック（React + TypeScript + Vite） | 採用 |
| [002](./002-styling.md) | スタイリング（CSS Modules） | 採用 |
| [003](./003-routing.md) | ルーティング（React Router） | 採用 |
| [004](./004-data-fetching.md) | データ取得（TanStack Query + fetch） | 採用 |
| [005](./005-testing.md) | テストフレームワーク（Vitest） | 採用 |
| [006](./006-directory-structure.md) | ディレクトリ構成（機能単位） | 採用（`src/test/` の扱いを 016 で補足） |
| [007](./007-import-path.md) | import のパス（`@/` の絶対パス） | 採用 |
| [008](./008-export-and-function-style.md) | export と関数の書き方 | 採用 |
| [009](./009-common-component-props.md) | 共通コンポーネントの props | 採用 |
| [010](./010-query-keys.md) | TanStack Query のキーの配置（キー専用ファイル） | 採用 |
| [011](./011-validation.md) | バリデーション（自前の関数） | 採用 |
| [012](./012-responsive.md) | レスポンシブ対応（2 パターン、ドロワー） | 採用（一部 013 で置き換え） |
| [013](./013-sass.md) | Sass（SCSS）の導入 | 採用 |
| [014](./014-file-naming.md) | ファイル名の付け方 | 採用 |
| [015](./015-api-mock.md) | テストでの API のモック（MSW） | 採用 |
| [016](./016-test-code-location.md) | テスト用コードの配置と依存ルール | 採用 |
| [017](./017-loading-and-error-display.md) | 取得中・エラーの表示（useQuery の状態で分岐） | 採用 |
| [018](./018-classname-utility.md) | 複数クラスの指定（clsx） | 採用 |
| [019](./019-formatter.md) | コードの整形（oxfmt） | 採用 |
