# Issue #002: Phase 2: 自動配信ワークフローおよび合成スクリプトの実装

- **ステータス**: 完了
- **作成日**: 2026-08-25
- **対象ブランチ**: `feature/002-setup-sync-workflow`

---

## 🎯 目的 / 概要

`core/` と `stacks/<stack>/` のアセットを各リポジトリ向けに合成（レイヤード結合・`AGENTS.md` 自動生成）し、対象リポジトリ（`asabon/agentic-sandbox-android` 等）へ GitHub Actions およびスクリプト経由で安全に PR を作成・同期する仕組みを構築する。

---

## 📋 要件 / 受け入れ基準 (Acceptance Criteria)

- [x] `config/repositories.json` で配信先リポジトリ（`asabon/agentic-sandbox-android`）が定義されていること
- [x] `scripts/sync.js` で以下の機能が動作すること
  - `core/` と `stacks/<stack>/` のディレクトリ・アセット重ね合わせ
  - ルール定義（`core/rules/*.md`, `stacks/<stack>/rules/*.md`）からの `AGENTS.md` 自動結合生成
  - `--dry-run` オプションによるプレビュー表示
  - `--output-dir <path>` オプションによるローカル出力検証
  - `--repo <name>` による単一リポジトリ指定
  - `--create-pr` による対象リポジトリへの PR 自動作成
- [x] GitHub Actions ワークフロー `.github/workflows/sync-to-repositories.yml` が定義されていること
- [x] `asabon/agentic-sandbox-android` へのテスト配信 PR が正常に作成・検証できること

---

## 💡 設計メモ・実装方針

- スクリプトは Node.js 標準モジュール（`fs`, `path`, `child_process`）のみを使用し、外部依存なしで Windows / Linux (CI) 双方で動作可能にする。
- `AGENTS.md` 生成時は各 Markdown のタイトルやセクション構造を適切にインクルードして、可読性の高い統合ルールファイルを構成する。

---

## 📝 完了チェックリスト

- [x] `scripts/sync.js` の実装とローカルドライラン動作確認
- [x] `config/repositories.json` の設定
- [x] `.github/workflows/sync-to-repositories.yml` の作成
- [x] `asabon/agentic-sandbox-android` への PR 発行検証
- [x] `docs/issues/002-setup-sync-workflow.md` の完了更新と PR 作成
