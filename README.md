# Agentic Dev Platform (エージェント開発環境配布プラットフォーム)

## 1. 概要 & 目的

複数のリポジトリおよび多様な技術スタック（Android, Godot, TypeScript 等）において、**Google Antigravity 向けのエージェント開発環境（Rules, Skills, Git Hooks, Issue/PR 運用フロー等）を一元管理し、各リポジトリへ自動で Pull Request を介して安全に配信・同期する共通基盤** です。

### 解決する課題
- **保守コストの分散**: アプリやツールごとに `.agents/` や `AGENTS.md`、各種スキルスクリプトを個別管理すると、改善やバグ修正の水平展開が困難になる。
- **マルチスタックへの対応**: 開発プロセス（Issue駆動・PR運用）は共通化しつつ、言語・フレームワーク固有（Ktlint, ESLint, gdformat, 計装テスト等）の規約・ツールを綺麗に分離して適用したい。
- **安全性とポータビリティ**: シンボリックリンクや環境依存を避け、各リポジトリ内に実体ファイルを配置しつつ、PR 経由で差分を確認・マージできるようにしたい。

---

## 2. アーキテクチャ設計 (レイヤード構造)

本プラットフォームは **「Core (全共通)」** と **「Stacks (技術スタック別)」** の 2 層レイヤーで構成します。

```text
agentic-dev-platform/ (中央リポジトリ)
├── core/                               # 【全プロジェクト共通】
│   ├── .agents/skills/
│   │   ├── create-issue/               # 汎用 Issue 起票スキル
│   │   └── create-pr/                  # 汎用 PR 作成スキル
│   ├── .githooks/                      # main 直プッシュ防止フック (pre-commit, pre-push)
│   ├── docs/issues/TEMPLATE.md         # Issue テンプレート
│   ├── .github/pull_request_template.md# PR テンプレート
│   └── rules/
│       ├── issue-driven-dev.md         # Issue 駆動開発の基本ルール
│       └── git-workflow.md             # ブランチ戦略・コミット規約
│
├── stacks/                             # 【技術スタック別モジュール】
│   ├── android/                        # Android (Kotlin) 向け
│   │   ├── .agents/skills/
│   │   │   ├── capture-screenshots/    # UI 画面キャプチャスキル
│   │   │   └── prepare-release/        # Android 版リリース準備スキル (versionCode/Name)
│   │   └── rules/
│   │       ├── kotlin-ktlint.md        # Ktlint フォーマット規約
│   │       └── test-strategy.md        # CI / 計装テスト分離規約
│   │
│   ├── typescript/                     # TypeScript / Node.js 向け
│   │   ├── .agents/skills/
│   │   │   └── prepare-release/        # package.json / npm リリース準備スキル
│   │   └── rules/
│   │       ├── linter-formatter.md     # ESLint, Prettier 規約
│   │       └── test-strategy.md        # Vitest / Jest, Playwright 規約
│   │
│   └── godot/                          # Godot (GDScript / C#) 向け
│       ├── .agents/skills/
│       │   └── run-gut-tests/          # GUT (Godot Unit Test) 実行スキル
│       └── rules/
│           ├── gdscript-style.md       # gdformat / コーディング規約
│           └── scene-architecture.md   # シーン設計・ノード構成ガイド
│
├── config/
│   └── repositories.json               # 配信先リポジトリ一覧 & スタック定義
└── .github/workflows/
    ├── sync-to-repositories.yml        # 各リポジトリへの PR 自動作成 CI
    └── validate-templates.yml          # テンプレート・スキルの構文・動作チェック
```

---

## 3. スタック別責務マトリクス

| 領域 | Core (全共通) | Android | TypeScript | Godot |
| :--- | :--- | :--- | :--- | :--- |
| **開発プロセス** | Issue起票、PR作成、ブランチ戦略 | ← 共通利用 | ← 共通利用 | ← 共通利用 |
| **コード・スタイル規約** | - | Ktlint, Android公式 | ESLint, Prettier | gdformat, C# スタイル |
| **テスト戦略** | CI とローカル実行の切り分け思想 | JUnit, UI計装テスト | Vitest, Jest, Playwright | GUT (Godot Unit Test) |
| **固有スキル** | `create-issue`<br>`create-pr` | `capture-screenshots`<br>`prepare-release` (Android) | `prepare-release` (npm) | `run-gut-tests` |
| **Git Hooks** | `main` 直接操作防止 | + 自動フォーマット検証 | + lint-staged / npm test | + gdformat 検証 |

---

## 4. 配布・同期メカニズム

### ① マニフェスト定義方式 (`config/repositories.json`)
中央リポジトリで配信対象リポジトリと適用スタックを一括管理します。
（※各リポジトリ側の `.agentsync.yml` によるセルフホスト設定も併用可能）

```json
[
  {
    "repo": "asabon/IntervalTimer",
    "stack": "android",
    "branch": "main",
    "custom_excludes": []
  },
  {
    "repo": "asabon/sample-godot-game",
    "stack": "godot",
    "branch": "main",
    "custom_excludes": []
  },
  {
    "repo": "asabon/cli-tool-ts",
    "stack": "typescript",
    "branch": "main",
    "custom_excludes": []
  }
]
```

### ② GitHub Actions 配信フロー (`sync-to-repositories.yml`)
1. **トリガー**:
   - リリース（タグ発行）時
   - 手動実行 (`workflow_dispatch`)
   - 定期実行 (Cron: 週次など)
2. **合成 (Merge)**:
   - `core/` のファイルをベースに、指定された `stacks/<stack>/` のファイルを上書き・合成。
   - `AGENTS.md` は共通ルールとスタックルールを結合して自動生成（またはインクルード形式）。
3. **PR 発行**:
   - 対象リポジトリに対してトピックブランチ（例: `chore/sync-agentic-platform-v1.0.0`）を作成。
   - 差分がある場合のみ `gh pr create`（または `peter-evans/create-pull-request`）で PR を作成。

---

## 5. ロードマップ & 導入ステップ

- [x] **Phase 1: リポジトリ初期構築**
  - [x] `agentic-dev-platform` リポジトリの作成
  - [x] 本設計書 (`agentic-dev-platform.md`) を `README.md` / 仕様書として配置
  - [x] `IntervalTimer` から `core/` および `stacks/android/` のアセットを抽出・構造化
- [x] **Phase 2: 自動配信ワークフローの実装**
  - [x] GitHub Actions による配信スクリプトの作成 (GitHub App または PAT を利用)
  - [x] `agentic-sandbox-android` を対象として配信テスト（PR 作成・マージ動作確認）
- [ ] **Phase 3: マルチスタック拡張**
  - `stacks/typescript/` の定義と専用スキル/ルールの実装
  - `stacks/godot/` の定義と専用スキル/ルールの実装
- [ ] **Phase 4: 運用洗練**
  - リポジトリ個別カスタマイズとのコンフリクト抑止（差分フック機構の強化）
  - リリースノート自動生成と連携
