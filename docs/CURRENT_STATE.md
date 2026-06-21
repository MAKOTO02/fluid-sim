# FluidInkArena 現状整理

最終確認日: 2026-06-21

## このプロジェクトについて

FluidInkArena は、Vite + TypeScript + WebGL で作られた、GPU 流体シミュレーションと弾幕ゲームを組み合わせる実験プロトタイプです。

大きく分けると、次の3つで構成されています。

- `src/scene` 以下の小さなコンポーネント型ゲーム基盤。
- `src/fluid` と `src/shaders` 以下の GPU 流体シミュレーション。
- `src/main.ts` で組み立てられる、プレイヤー、敵、弾、衝突、流体干渉を含むゲーム試作。

## 入口

- `index.html`: 全画面キャンバスを用意する。
- `src/main.ts`: WebGL、シェーダ、流体、シーン、プレイヤー、敵、メインループを初期化する。
- `vite.config.ts`: GitHub Pages 配信用と思われる `base: "/fluid-sim/"` を設定している。

## 開発環境

このプロジェクトは VSCode を主な開発環境として進める想定です。

もともとは日本語コメントがありましたが、管理しやすさを優先して `src` 以下のコメントは英語へ置き換え済みです。

## 実行時の流れ

`src/main.ts` が現在の中心です。

1. キャンバスと WebGL コンテキストを作る。
2. シーン用シェーダと流体用シェーダを読み込む。
3. FBO と `FluidSim` を作る。
4. シーン、カメラ、流体表示用の平面、障害物レイヤー、stream レイヤー、プレイヤー、エミッター、敵を作る。
5. アニメーションループで次を繰り返す。
   - キャンバスのリサイズ確認。
   - シーン更新。
   - stream / obstacle 情報を流体用ターゲットへ描画。
   - 流体シミュレーションを更新。
   - 最終シーンを描画。

## 流体シミュレーション

流体の本体は `src/fluid/fluidSim.ts` です。

GPU の framebuffer と texture で、次の情報を持っています。

- 速度場
- dye / 見た目のインク
- logic dye
- curl
- divergence
- pressure
- stream force
- obstacle mask

`FluidSim.step()` の主な流れは次の通りです。

1. curl を計算する。
2. vorticity confinement を適用する。
3. 重力、加速度、stream などの物理力を適用する。
4. divergence を計算する。
5. pressure をクリアする。
6. pressure solve を行う。
7. pressure gradient を速度場から引く。
8. 速度、dye、logic dye を移流する。

ゲーム側との接続点:

- `FluidEmitter`: オブジェクトの動きから流体へ splat を打つ。
- `FluidDrag`: 流体速度を読み取り、`RigidBody` に力を加える。
- `FluidSampler`: logic dye を読み取り、ゲーム効果へ変換できる。

## ゲーム部分

現在入っているゲーム要素:

- `src/main.ts` でプレイヤー球を作成している。
- `PlayerController` で `WASD` / 矢印キー移動を行う。
- キャンバスクリックでプレイヤー弾を撃つ。
- `Enemy` と `EnemyConfig` で敵を作っている。
- 敵は一定間隔で5wayの扇状弾を撃つ。
- 弾は local path または UV path で移動できる。
- `CollisionSystem` による単純な球トリガー衝突がある。

関連ファイル:

- `src/scene/playerController.ts`
- `src/scene/enemy.ts`
- `src/scene/enemyConfig.ts`
- `src/scene/enemyStrategy.ts`
- `src/scene/projectile.ts`
- `src/scene/projectileActor.ts`
- `src/scene/collisionSystem.ts`

## 確認したこと

次のコマンドは成功しました。

```powershell
.\node_modules\.bin\tsc.cmd --noEmit
.\node_modules\.bin\vite.cmd build
```

注意点:

- VSCode での通常開発では `npm run dev` で開発サーバーを起動できる。
- Codex の実行環境では `npm run build` がローカル npm 参照の都合で失敗したが、これは VSCode での開発環境が壊れているという意味ではない。
- `node_modules\.bin` から直接実行すれば TypeScript と Vite は動く。
- Codex の sandbox では、`vite build` 時に esbuild が workspace 外の親ディレクトリを解決しようとして止まった。権限付き実行では成功した。
- `git status` は Git の dubious ownership 保護で止まった。必要なら safe.directory 登録で直せる。

## まず片付けたいこと

新しい機能を足す前に、次の整理が有効です。

1. `src/main.ts` の初期化処理を小さな setup モジュールへ分ける。
2. 流体を「演出中心」にするか「ゲーム性に強く効く要素」にするか決める。
3. プレイヤー弾、敵弾、プレイヤー、敵、壁の衝突レイヤーを明確にする。
4. FPS、流体 pause、プレイヤー位置、弾数などを見る簡易デバッグ表示を追加する。
5. `main.ts` や shader 内の仮チューニング値を、名前付き config に寄せる。

## おすすめの再開順

1. ドキュメント整理: README、操作、アーキテクチャメモ。
2. 構造整理: `main.ts` を app setup、fluid setup、scene setup、gameplay setup に分ける。
3. ゲーム設計: 流体がゲームにどう効くかを決めて、コア体験を固める。
