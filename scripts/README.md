# 同期・配信スクリプト (scripts/sync.js)

`agentic-dev-platform` のアセット（`core/` および `stacks/<stack>/`）を各リポジトリに合成・配信するためのコアスクリプトです。

---

## 主な機能

1. **レイヤード合成**: `core/` をベースに `stacks/<stack>/` を上書き合成。
2. **`AGENTS.md` 自動統合生成**: `core/rules/*.md` と `stacks/<stack>/rules/*.md` を 1 つの `AGENTS.md` に集約。
3. **安全なドライラン**: 実際の変更を加えず、合成対象ファイルのプレビューが可能。
4. **PR 自動作成**: 対象リポジトリを一時クローンし、トピックブランチ作成・コミット・プッシュ・PR 発行まで一貫実行。

---

## 使い方

### 1. ドライラン（プレビュー）
```bash
node scripts/sync.js --dry-run
```

### 2. ローカルディレクトリへの出力（検証）
```bash
node scripts/sync.js --output-dir scratch/test_output
```

### 3. 特定のリポジトリのみ対象にする
```bash
node scripts/sync.js --repo asabon/agentic-sandbox-android --dry-run
```

### 4. PR 自動作成（ローカル実行）
※ 事前に `gh auth status` で GitHub 認証が必要です。
```bash
node scripts/sync.js --repo asabon/agentic-sandbox-android --create-pr
```
