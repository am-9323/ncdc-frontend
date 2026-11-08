# 015. テストでの API のモック（MSW）

- ステータス: 採用

## コンテキスト

テストでは `vi.spyOn(globalThis, 'fetch')` で fetch を差し替え、メソッドごとに if 文で分岐する自前のモックを使っていた。結合テストを増やすと PUT や `GET /content/:id` の分岐も必要になり、自前のモックが膨らむため、モックの方法を見直す。

## 決定

[MSW（Mock Service Worker）](https://mswjs.io/) を使う。

- API のモックとして定番で、情報が多い
- URL とメソッドごとにハンドラーを書けるため、自前の分岐が不要になる

### 使い方

- `src/test/server.ts` のサーバーを `setup.ts` で起動する。ハンドラーのないリクエストはエラーにする
- ページの API は `src/test/mocks/content.ts` の `mockContentApi` で、メモリ上の一覧を操作するモックとして登録する

## 検討した選択肢

- 自前のモック（`vi.spyOn` で fetch を差し替える）: 依存は増えないが、エンドポイントが増えるたびに分岐を自分で書く必要があり、参考にできる情報もないため不採用
