---
name: create-pr
description: >-
  Create a standardized GitHub Pull Request using GitHub CLI (gh pr create)
  based on .github/pull_request_template.md and current branch diff.
---

# GitHub Pull Request 作成スキル

このスキルは、トピックブランチの作業完了時に一貫したフォーマットで GitHub Pull Request を作成・発行するための手順書です。

## 前提条件
- 現在の作業がすべてコミットされており、リモートブランチへ push されていること。
- `gh auth status` で GitHub CLI が認証済みであること。

## 手順

1. **ブランチとコミットログの確認**
   - 対象ブランチ名、ベースブランチ（通常 `main`）、コミット履歴を確認する。
   ```bash
   git log origin/main..HEAD --oneline
   ```

2. **PR タイトルと本文の構成**
   - タイトル形式: `[種別] Issue #XXX: 概要`
     - 例: `[Feature] Issue #002: ユーザー認証機能の実装`
     - 例: `[Fix] Issue #005: 画面リサイズ時のレイアウト崩れを修正`
   - 本文形式: `.github/pull_request_template.md` の項目（概要、関連 Issue、変更内容、動作確認、備考）に沿って Markdown を一時ファイル（例: `scratch/pr_body.md`）に書き出す。
   - ※ シェルのエスケープによる Markdown 崩れ（バッククォートの消失等）を防ぐため、`--body` 引数での直接指定は禁止し、必ず `--body-file` を使用する。

3. **PR 作成コマンドの実行**
   - ブランチプレフィックスに応じた対応ラベル（`feature`, `fix`, `refactor`, `docs`, `chore`, `test`）を `--label` で指定する。
   ```bash
   gh pr create --title "[種別] Issue #XXX: タイトル" --body-file "<一時ファイルの絶対パス>" --label "<対応ラベル>" --base main
   ```

4. **結果の報告**
   - 作成された PR の URL と概要をユーザーに提示する。
