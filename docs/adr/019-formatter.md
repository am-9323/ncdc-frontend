# 019. コードの整形（oxfmt）

- ステータス: 採用

## コンテキスト

整形には Prettier を使っていたが、選んだ特別な理由はなかった。静的解析は、プロジェクトの雛形に標準で入っていた oxlint を使っている。

## 決定

整形は [oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) を使う。

- 雛形に入っていた oxlint に合わせ、同じ Oxc のツールでそろえる
- 軽量で速い
- Prettier と同じ設定（`semi: false`、`singleQuote: true`、`printWidth: 80`）で出力がほぼ変わらず、移行の手間が小さい
- 設定は `.oxfmtrc.json`。`oxfmt --migrate prettier` で Prettier の設定から作成した
- まだ 1.0 前のため、バージョンは固定する

## 検討した選択肢

- Prettier のまま: 定番で実績はあるが、選んだ理由が特になく、oxlint とツールが分かれるため不採用
