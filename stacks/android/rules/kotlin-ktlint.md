# Kotlin & Ktlint コーディング規約

Android (Kotlin) 開発におけるコードスタイルおよびフォーマット規約です。

---

## 1. 言語 & スタイル (Ktlint 準拠)

- 言語は **Kotlin** を使用し、Android 公式 Kotlin スタイルガイドおよび Ktlint（`ktlint { android.set(true) }`）に準拠する。
- 責務分離（UI / ViewModel / Domain / Data 等）を意識したモダンな Android アーキテクチャを適用する。
- 非同期処理・時間計測には Kotlin Coroutines / Flow を適切に活用する。
- 文字列、カラー、寸法等の固定値はハードコードを避け、リソース定義（`res/values` やテーマ定数）で管理する。
- `.idea/` や `local.properties`、ビルド成果物（`/build`）などの環境依存・自動生成ファイルはコミット対象外を徹底する。

---

## 2. コード修正後の自動フォーマットの徹底

Antigravity はコードの追加・修正を行った際、**必ずコミット前・ユーザーへの完了報告前に `./gradlew ktlintFormat`（または `./gradlew ktlintCheck`）を実行** し、コードフォーマットが完璧に整った状態であることを確認してから報告する。

```bash
./gradlew ktlintFormat
```
