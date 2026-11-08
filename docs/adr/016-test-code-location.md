# 016. テスト用コードの配置と依存ルール

- ステータス: 採用

## コンテキスト

API のモック（`mockContentApi`）やテストデータを作る関数の置き場所を決める。これらは `Content` の型など機能の知識を持つ。ADR 006 の依存の一方向ルール（共通 → features → app）で、`src/test/` がどう扱われるかが曖昧だった。

## 決定

テスト用のコードは `src/test/` に集約する。`src/test/` は一方向ルールの対象外とし、features・app を import してよい。

```
src/test/
├── mocks/              # API のモック（機能ごとのファイル）
├── data-generators.ts  # テストデータを作る関数
├── render.tsx          # Provider 付きの描画
├── server.ts           # MSW のサーバー
└── setup.ts
```

- 参考にした bulletproof-react も `src/testing/` にモックを集約し、一方向ルールの対象外としている
- テスト用のコードは本番のコードから import されないため、逆向きに依存しても本番の構成に影響しない
- 本番のコードから `src/test/` を import することは禁止する

## 検討した選択肢

- 機能ごとに置く（`features/content/test/`）: 一方向ルールの例外は不要だが、参考にした構成と異なり、機能をまたぐ結合テストではモックの置き場所が分散するため不採用
