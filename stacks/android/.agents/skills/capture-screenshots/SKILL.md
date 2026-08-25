---
name: capture-screenshots
description: >-
  Capture application screenshots from a connected Android device or emulator via ADB
  and save them to the screenshots/ directory.
---

# Android 画面キャプチャスキル (capture-screenshots)

UIの追加・変更・リファクタリング時、またはリリース準備時に、接続中の Android 実機またはエミュレータからスクリーンショットを取得・更新するためのスキルです。

## 前提条件
- Android 実機またはエミュレータ（AVD）が起動しており、`adb devices` で認識されていること。
- アプリが対象画面を表示している状態であること。

## 手順

1. **キャプチャスクリプトの実行**
   ```powershell
   & .\.agents\skills\capture-screenshots\scripts\capture.ps1
   ```
   ※ 単一画面の撮影を行う場合は、引数でファイル名を指定可能：
   ```powershell
   & .\.agents\skills\capture-screenshots\scripts\capture.ps1 -Name "custom_screen.png"
   ```

2. **取得画像の確認**
   - `screenshots/` 配下に保存された PNG 画像の存在・サイズ・更新日時を確認する。

3. **コミット**
   - UI 変更のトピックブランチにおいて、更新されたスクリーンショットをコミットに含める。
