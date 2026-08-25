# Android テスト戦略 & 計装テスト規約

Android 開発における CI（GitHub Actions）とローカル環境でのテスト実行の役割分担規約です。

---

## 1. CI（GitHub Actions）とローカル環境の役割分担

- **CI 上の実行範囲**:
  - 高速かつ安定したフィードバックを維持するため、**単体テスト（UnitTest）、Android Lint、Ktlint チェック、および計装テストのコンパイル疎通（`compileDebugAndroidTestSources`）** を自動実行する（エミュレータ起動のオーバーヘッド・不安定化の回避）。
- **ローカル環境の実行範囲**:
  - 実機またはエミュレータ（AVD）を用いた **UI 計装テスト（`connectedCheck`）はローカル環境で適切なタイミングで実行** する。

---

## 2. ローカルでの計装テスト実行タイミング

1. **UI・画面遷移・状態結合に関する Issue 実装時**:
   - 完了報告前に実機/エミュレータが起動している場合は `./gradlew connectedCheck` を実行して検証する（未接続時は `compileDebugAndroidTestSources` でビルド疎通を確認）。
2. **リリース準備時 (`prepare-release`)**:
   - バージョン更新時およびリリース前検証として `./gradlew connectedCheck`（またはエミュレータ接続下でのテスト）を実行する。
3. **Android Studio での個別検証**:
   - クラスやメソッド単位の実行ボタン（▶）で即座にデバッグ・確認する。

---

## 3. UI変更時のスクリーンショット自動更新 (`screenshots/`)

UIの追加・画面レイアウトの変更・デザイン修正を行った際は、**完了報告および PR 作成前に必ず `capture-screenshots` スキル（`& .\.agents\skills\capture-screenshots\scripts\capture.ps1`）を実行** し、`screenshots/` 配下のスクリーンショットを最新状態に自動更新・配置する。
