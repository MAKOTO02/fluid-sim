# FluidInkArena

FluidInkArena は、GPU 流体シミュレーションと弾幕ゲーム要素を組み合わせた TypeScript/WebGL 製のプロトタイプです。

現在のコードは開発途中の実験プロジェクトです。詳しい現状整理は `docs/CURRENT_STATE.md` にまとめています。

## 操作

- 移動: `WASD` または矢印キー
- 射撃: キャンバスをクリック

## 構成

- `src/main.ts`: アプリ全体の組み立てとゲームループ
- `src/fluid`: 流体シミュレーション本体
- `src/shaders`: WebGL シェーダ
- `src/scene`: 自作のコンポーネント型ゲーム基盤
- `src/gl`: WebGL 補助コード
- `docs/CURRENT_STATE.md`: 現状メモと再開方針

## 開発環境

このプロジェクトは VSCode を主な開発環境として進める想定です。

## 確認済みコマンド

VSCode 環境では通常どおり `npm run dev` で開発サーバーを起動できます。

```powershell
npm run dev
```

Codex の実行環境では、必要に応じて `node_modules\.bin` から直接確認できます。

```powershell
.\node_modules\.bin\tsc.cmd --noEmit
.\node_modules\.bin\vite.cmd build
```

## まず整理したいこと

新しいゲーム内容を足す前に、次を片付けると再開しやすくなります。

1. 大きくなっている `src/main.ts` を setup 系の小さなモジュールに分ける。
2. プレイヤー弾、敵弾、プレイヤー、敵、壁の衝突ルールを明確にする。
3. 流体を「見た目中心」にするか「ゲーム性に強く効かせる」か決める。

日本語コメントは管理しやすさを優先して英語コメントへ置き換え済みです。
