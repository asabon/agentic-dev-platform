# Issue #001: Phase 1: core/ および stacks/android/ 構成の構築

- **ステータス**: 完了
- **作成日**: 2026-08-25
- **対象ブランチ**: `feature/001-setup-core-and-android-stack`

---

## 🎯 目的 / 概要

README.md の Phase 1 に基づき、`IntervalTimer` からエージェント開発環境アセット（ルール、スキル、Git Hooks、各種テンプレート）を抽出し、汎用的な `core/`（全共通）と `stacks/android/`（Android 特化）のレイヤード構造として構築・配置する。

---

## 📋 要件 / 受け入れ基準 (Acceptance Criteria)

- [x] `core/` 配下に汎用スキル（`create-issue`, `create-pr`）を配置
- [x] `core/` 配下に誤操作防止 Git Hooks（`pre-commit`, `pre-push`）を配置
- [x] `core/` 配下に汎用テンプレート（Issue テンプレート、PR テンプレート）を配置
- [x] `core/` 配下に開発ルール（`issue-driven-dev.md`, `git-workflow.md`）を配置
- [x] `stacks/android/` 配下に Android 専用スキル（`capture-screenshots`, `prepare-release`）を配置
- [x] `stacks/android/` 配下に Android 開発規約（`kotlin-ktlint.md`, `test-strategy.md`）を配置
- [x] `config/repositories.json` に配信対象リポジトリ初期設定を配置

---

## 💡 設計メモ・実装方針

- 言語非依存のプロセス（Issue駆動、ブランチ規約、PR作成）は `core/` に集約。
- Kotlin/Ktlint や Android SDK・ADB に依存するアセットは `stacks/android/` に分離。
- Phase 2 以降で GitHub Actions による自動合成・配信ワークフローを実装予定。

---

## 📝 完了チェックリスト

- [x] 受け入れ基準を満たす実装およびファイルの作成完了
- [x] ディレクトリ構造およびファイル命名の整合性確認
- [x] 作業ブランチでのコミットと PR 発行
