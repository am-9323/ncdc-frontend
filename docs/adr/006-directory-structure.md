# 006. ディレクトリ構成（機能単位）

- ステータス: 採用

## コンテキスト

実装に入る前に、コンポーネント・API・スタイルなどの配置方針を決める。

## 決定

[bulletproof-react](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md) を簡略化した、機能単位の構成とする。

```
src/
├── app/
│   ├── routes/        # 画面（URL パラメータを受け取り features を組み合わせるだけの薄い層）
│   ├── router.tsx     # URL と routes の対応表
│   ├── provider.tsx
│   └── app.tsx
├── features/
│   └── content/       # 機能
│       ├── api/
│       ├── components/
│       └── types.ts
├── components/        # 業務知識を持たない共通 UI（ボタン、AppLayout など）
├── config/            # URL などアプリ全体の設定
├── lib/               # fetch のラッパーなど
├── styles/            # CSS 変数（デザイントークン）、グローバル CSS
└── test/              # テストの共通設定
```

- 依存は `共通（components / lib / styles）→ features → app` の一方向とし、逆向きの import はしない
- 「content の API や型を知っているか」で features か共通かを判断する
- コンポーネントはフォルダを切り、tsx・`.module.css`・テストを同じ場所に置く
- barrel ファイル（`index.ts`）は作らず、直接 import する

### 選定理由

今回はシンプルなAPIをベースとした画面になると想定されるので、機能単位でディレクトリを分ける本構成がマッチしていると考えた。
また、機機の追加・修正をしたいときに見に行く場所がわかりやすく拡張性・保守性が高いと考えたため。

## 検討した選択肢

- 種類別（components / hooks / api を src 直下に並べる）: 1 つの機能の修正でディレクトリを行き来する必要があり、機能のまとまりが読み取れないため不採用
- アトミックデザイン : コンポーネントの単位がわかりづらいため不採用