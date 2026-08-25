# Antigravity 開発ガイドライン (agentic-dev-platform)

本リポジトリにおけるエージェント開発環境および開発ルールです。

---

# Issue 駆動開発ワークフロー規約 (`docs/issues/`)

あらゆる変更（新機能開発、バグ修正、リファクタリング、ドキュメント更新、ビルド設定・依存関係の保守 `chore` を含む）において、**例外なく以下のステップ順序に従って作業を進める**。

---

## 標準作業フロー（ステップ順序）

1. **Issue の起票**:
   - 作業開始前に必ず `docs/issues/<3桁連番>-<概要>.md` を作成する（例: `001-setup-core.md`）。
   - 雛形として [`core/docs/issues/TEMPLATE.md`](core/docs/issues/TEMPLATE.md) を使用し、目的と受け入れ基準（Acceptance Criteria）を明記する。
   - ※ Issue 作成時は `.agents/skills/create-issue/` スキルを活用する。

2. **トピックブランチの作成**:
   - 起票した Issue 番号に基づき、`<タイプ>/<3桁連番>-<概要>` のブランチを作成して切り替える（例: `feature/001-setup-core`, `chore/002-upgrade-deps`）。

3. **実装 & 小単位コミット**:
   - 定義した受け入れ基準を満たす実装・テストを行い、小さな単位でコミットする。

4. **受け入れ基準の検証と Issue 完了更新**:
   - 動作確認を行い、Issue ファイルの受け入れ基準チェックボックスを埋め、ステータスを `完了` に更新してコミットする。
   - 関連する進捗管理ドキュメント（`README.md` のロードマップ等）が存在する場合は併せて更新する。

5. **Pull Request (PR) の発行**:
   - リモートへプッシュ後、`.agents/skills/create-pr/` スキルまたは `gh pr create` を使用して PR を発行する。

---

## 作業中の別要件・スコープ管理ルール

トピックブランチで作業中に、別件の相談・新規アイデア・バグ報告が発生した場合は以下の通り対応する：

- **無関係な変更の混入禁止**: 現在の Issue スコープ外の変更を同一ブランチに勝手に含めてはならない。
- **ユーザーへの確認と選択肢の提示**:
  1. **仕様変更/改善（スコープ内）**: 現在の Issue の受け入れ基準を更新して同一ブランチで実装。
  2. **新規アイデア/別要件（通常）**: `docs/issues/` やロードマップに新 Issue / ToDo を起票し、まずは現在の作業を完了・マージさせる（推奨）。
  3. **緊急の別要件**: 現在の作業を退避（コミットまたは stash）し、`main` から新トピックブランチを作成して優先対応。

---

# Git / GitHub 開発ワークフロー & コミット規約

開発におけるブランチ戦略、コミット規約、PR 運用、および誤操作防止のルールです。

---

## 1. ブランチ戦略 (GitHub Flow)

- **`main` ブランチ**: 常に安定してリリース可能な状態を維持する。直接の `commit` および `push` は禁止。
- **トピックブランチ**: 作業目的に応じたプレフィックスを付け、`<タイプ>/<3桁連番>-<概要>` の形式で作成する（例: `feature/001-setup-core`）。

| プレフィックス | 用途・選定基準 | 具体例 |
| :--- | :--- | :--- |
| **`feature/`** | 新機能の追加・新規仕様の実装 | `feature/001-setup-core` |
| **`fix/`** | バグや不具合の修正 | `fix/003-sync-diff-check` |
| **`refactor/`** | 仕様を変えない構造改善・リファクタリング | `refactor/005-extract-sync-module` |
| **`docs/`** | ドキュメント類（README, 設計等）の追加・修正 | `docs/002-update-specs` |
| **`chore/`** | 設定・依存関係更新・開発環境整備 | `chore/004-setup-self-agent` |
| **`test/`** | テストの追加・更新 | `test/006-sync-unit-tests` |

---

## 2. Git Hooks による誤操作防止

- リポジトリの `.githooks/` 配下に `pre-commit` および `pre-push` を配置し、`main` への直接操作をブロックする。
- リポジトリ初期設定コマンド:
  ```bash
  git config core.hooksPath .githooks
  ```

---

## 3. プルリクエスト (PR) 運用

- 作業完了後は GitHub 上で Pull Request を作成し、レビュー・CI 検証を経て `main` へマージ（Squash and merge または Rebase and merge 推奨）する。
- PR 作成時は [`.github/pull_request_template.md`](.github/pull_request_template.md) のフォーマットを適用し、タイトルは `[種別] Issue #XXX: 概要` とする。
- PR 発行には GitHub CLI (`gh pr create`) または `.agents/skills/create-pr/` スキルを活用する。

---

## 4. コミット単位 & メッセージ規約

- 1 つの論理的な変更ごとに小さな単位でコミットする。
- コミットメッセージは**日本語**で、変更内容が明確にわかるように記述する（例: `配信スクリプトの差分判定ロジックを修正`, `README.md のロードマップを更新` など）。
