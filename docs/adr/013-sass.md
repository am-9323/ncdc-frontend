# 013. Sass（SCSS）の導入

- ステータス: 採用

## コンテキスト

レスポンシブの切り替え幅（1023px）を 5 つの CSS に直接書いていた（012）。`@media` では CSS 変数を使えないため、素の CSS では共通化できない。

## 決定

CSS Modules（002）はそのままに、すべての CSS を SCSS にする。

- 切り替え幅を `src/styles/_variables.scss` の Sass 変数にまとめ、`@use` で読み込む
- Sass の機能は、今は変数だけを使う。入れ子などは使わず、書き方は CSS のままとする
- `.css` と `.scss` が混ざらないよう、すべて `.scss` にそろえる。ADR 006 の `.module.css` は `.module.scss` と読み替える
- Sass の `@use` には `tsconfigPaths` が効かないため、`vite.config.ts` に `@/` のエイリアスを追加する

## 検討した選択肢

- 各 CSS に直接書く（012 の方針）: 値が 1 つでも、変更時に複数ファイルを直す必要があるため置き換え
- `@media` を使うファイルだけ SCSS にする: `.css` と `.scss` が混ざるため不採用
