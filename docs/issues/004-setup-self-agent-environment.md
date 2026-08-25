# Issue #004: agentic-dev-platform 自体へのエージェント開発環境の適用 (ドッグフーディング)

- **ステータス**: 完了
- **作成日**: 2026-08-25
- **対象ブランチ**: `chore/004-setup-self-agent-environment`

---

## 🎯 目的 / 概要

本リポジトリ（`agentic-dev-platform`）自体でも Antigravity のセッション開始時に開発ルールおよび汎用スキルが自動読み込みされるよう、`core/` のアセット（`AGENTS.md`, `.agents/skills/`, `.githooks/`）をリポジトリ直下に配置・同期する。

---

## 📋 要件 / 受け入れ基準 (Acceptance Criteria)

- [x] リポジトリ直下に `AGENTS.md` が配置されていること（Issue 駆動、Git フロー規約を含む）
- [x] リポジトリ直下に `.agents/skills/`（`create-issue`, `create-pr`）が配置されていること
- [x] リポジトリ直下に `.githooks/`（`pre-commit`, `pre-push`）が配置されていること
- [x] Antigravity の自動コンテキスト読み込みが有効になること

---

## 💡 設計メモ・実装方針

- `core/rules/`（`git-workflow.md`, `issue-driven-dev.md`）から本リポジトリ向けの `AGENTS.md` を生成。
- `core/.agents/skills/` および `core/.githooks/` をリポジトリ直下に配置。

---

## 📝 完了チェックリスト

- [x] `AGENTS.md` の生成・配置
- [x] `.agents/skills/` の配置
- [x] `.githooks/` の配置
- [x] コミット & PR 作成
