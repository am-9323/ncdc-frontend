# 010. TanStack Query のキーの配置（キー専用ファイル）

- ステータス: 採用

## コンテキスト

R4 で 1 件取得と更新の API が増え、`get-contents.ts` にある `contentKeys` を複数のファイルから参照するようになった。一覧と詳細の両方を無効化する `all` は、どちらの取得ファイルにも属さない。

## 決定

`src/features/content/api/content-keys.ts` にキーをまとめる。

- `all` の置き場所ができる
- `get-content.ts` がキーのためだけに `get-contents.ts` へ依存しなくて済む

## 検討した選択肢

- 取得ファイルに同居（`get-contents.ts`）: Query が 1 つなら十分だが、`detail` と `all` の置き場所が不自然なため不採用
- `queryOptions` を取得ファイルに定義: `all` の置き場所が別に必要なため不採用
