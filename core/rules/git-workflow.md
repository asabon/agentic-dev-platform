# Git / GitHub 開発ワークフロー & コミット規約

開発におけるブランチ戦略、コミット規約、PR 運用、および誤操作防止のルールです。

---

## 1. ブランチ戦略 (GitHub Flow)

- **`main` ブランチ**: 常に安定してリリース可能な状態を維持する。直接の `commit` および `push` は禁止。
- **トピックブランチ**: 作業目的に応じたプレフィックスを付け、`<タイプ>/<3桁連番>-<概要>` の形式で作成する（例: `feature/001-user-auth`）。

| プレフィックス | 用途・選定基準 | 具体例 |
| :--- | :--- | :--- |
| **`feature/`** | 新機能の追加・新規仕様の実装 | `feature/001-timer-core-state` |
| **`fix/`** | バグや不具合の修正 | `fix/005-timer-drift` |
| **`refactor/`** | 仕様を変えない構造改善・リファクタリング | `refactor/008-extract-timer-service` |
| **`docs/`** | ドキュメント類（README, ROADMAP, 設計等）の追加・修正 | `docs/002-update-architecture` |
| **`chore/`** | ビルド設定・依存関係更新・保守作業 | `chore/004-upgrade-deps` |
| **`test/`** | 単体テスト・結合テストの追加・更新 | `test/006-viewmodel-tests` |

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
- PR 作成時は [`.github/pull_request_template.md`](.github/pull_request_template.md) のフォーマットを適用し、タイトルは `[種別] Issue #XXX: 概要` とする（種別は `[Feature]`, `[Fix]`, `[Refactor]`, `[Docs]`, `[Chore]`, `[Test]`）。
- PR 発行には GitHub CLI (`gh pr create`) または `.agents/skills/create-pr/` スキルを活用する。

---

## 4. コミット単位 & メッセージ規約

- 1 つの論理的な変更ごとに小さな単位でコミットする。
- コミットメッセージは**日本語**で、変更内容が明確にわかるように記述する（例: `ユーザー認証のバリデーション処理を追加`, `ROADMAP.md の進捗を更新` など）。
