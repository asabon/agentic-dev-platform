---
name: prepare-release
description: >-
  Prepare a new Android application release by incrementing versionCode, updating versionName,
  creating a release issue/PR, verifying tests, and handling post-merge tag publishing.
---

# Android リリース準備・発行スキル (prepare-release)

ユーザーから「リリースしたい」または「`vX.Y.Z` をリリースしたい」と依頼された際に実行するスキルです。

---

## 🎯 リリース準備フロー (Release Preparation)

### 1. リリースバージョンの確認 & 更新
1. バージョン情報の決定：
   - ユーザーからバージョン（例: `"1.0.0"`）が指定された場合はそのバージョンを使用する。
   - バージョンが明示されていない場合は `gh release list` 等で最新/Draft バージョンを確認して決定する。
2. `app/build.gradle.kts` を更新：
   - 現在の `versionCode` を特定し、`+1` したものに更新する。
   - `versionName` を決定したバージョン（例: `"1.0.0"`）に更新する。
3. 現在の最大 Issue 番号を確認し、リリース用の Issue を `docs/issues/<3桁連番>-release-vX.Y.Z.md` として作成する。
4. トピックブランチ `chore/<3桁連番>-release-vX.Y.Z` を作成・切り替える。
   ```bash
   git switch main
   git pull origin main
   git switch -c chore/<3桁連番>-release-vX.Y.Z
   ```

### 2. コード検証 & コミット
1. Ktlint、Lint、テスト（単体テストおよび計装テストコンパイル）を実行して検証する。実機/エミュレータ接続時は `connectedCheck` も実行する。
   ```bash
   ./gradlew ktlintFormat ktlintCheck lint test compileDebugAndroidTestSources
   ```
2. 変更をコミットする。
   ```bash
   git add app/build.gradle.kts docs/issues/<3桁連番>-release-vX.Y.Z.md docs/ROADMAP.md
   git commit -m "chore: リリース vX.Y.Z に向けたバージョン更新 (versionCode: XX)"
   ```

### 3. Pull Request の作成
1. ブランチをリモートへプッシュする。
   ```bash
   git push -u origin chore/<3桁連番>-release-vX.Y.Z
   ```
2. GitHub CLI で PR を作成する（タイトル: `[Chore] Issue #<3桁連番>: リリース vX.Y.Z`、`--label "chore"` を付与）。
   ```bash
   gh pr create --title "[Chore] Issue #<3桁連番>: リリース vX.Y.Z" --body-file "<一時ファイルのパス>" --label "chore" --base main
   ```
3. ユーザーへ PR URL を案内し、レビューおよび `main` へのマージを依頼する。

---

## 🏷️ リリースタグ発行フロー (Post-Merge Tag Publishing)

ユーザーから「PR をマージしました」と連絡を受けた後の手順：

1. `main` ブランチに切り替えて最新コミットを取得し、不要になったトピックブランチを削除する。
   ```bash
   git switch main
   git pull origin main
   git branch -D chore/<3桁連番>-release-vX.Y.Z
   ```
2. リリースタグを作成し、リモートへプッシュする。
   ```bash
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```
3. 古い Draft リリースのクリーンアップ：
   - `gh release list` を確認し、今回リリースしたタグと異なる名前で残っている未公開の古い Draft が存在する場合は、クリーンアップ（削除）する。
4. GitHub Actions のリリースワークフローが起動したことをユーザーに報告し、リリースページから成果物（AAB / APK）が取得可能になる旨を案内する。
