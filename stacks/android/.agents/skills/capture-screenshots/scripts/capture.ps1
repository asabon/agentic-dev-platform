# capture.ps1: Android 端末 / エミュレータからスクリーンショットを取得して screenshots/ に保存するスクリプト

param(
    [string]$Name = ""
)

$ErrorActionPreference = "Stop"

# 1. adb コマンドのパス解決
$adbPath = $null
if (Get-Command adb -ErrorAction SilentlyContinue) {
    $adbPath = "adb"
} elseif ($env:ANDROID_HOME -and (Test-Path "$env:ANDROID_HOME\platform-tools\adb.exe")) {
    $adbPath = "$env:ANDROID_HOME\platform-tools\adb.exe"
} elseif ($env:ANDROID_SDK_ROOT -and (Test-Path "$env:ANDROID_SDK_ROOT\platform-tools\adb.exe")) {
    $adbPath = "$env:ANDROID_SDK_ROOT\platform-tools\adb.exe"
} else {
    $defaultSdkPath = Join-Path $env:LOCALAPPDATA "Android\Sdk\platform-tools\adb.exe"
    if (Test-Path $defaultSdkPath) {
        $adbPath = $defaultSdkPath
    }
}

if (-not $adbPath) {
    Write-Error "ADB (adb.exe) が見つかりませんでした。Android SDK のパスが通っているか確認してください。"
    exit 1
}

# 2. 接続デバイス確認
$devices = & $adbPath devices | Where-Object { $_ -match "\s+device$" }
if (-not $devices) {
    Write-Warning "接続されている Android デバイス / エミュレータが見つかりません。"
    exit 1
}

# 3. 保存先ディレクトリの作成
$projectRoot = Get-Location
$screenshotsDir = Join-Path $projectRoot "screenshots"
if (-not (Test-Path $screenshotsDir)) {
    New-Item -ItemType Directory -Path $screenshotsDir -Force | Out-Null
}

# 4. スクリーンショットの撮影と取得
if ($Name -ne "") {
    if (-not $Name.EndsWith(".png")) {
        $Name = "$Name.png"
    }
    $remotePath = "/sdcard/$Name"
    $localPath = Join-Path $screenshotsDir $Name

    Write-Host "📸 スクリーンショットを撮影中: $Name ..." -ForegroundColor Cyan
    & $adbPath shell screencap -p $remotePath
    & $adbPath pull $remotePath $localPath | Out-Null
    & $adbPath shell rm $remotePath
} else {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $fileName = "screenshot_$timestamp.png"
    $remotePath = "/sdcard/$fileName"
    $localPath = Join-Path $screenshotsDir $fileName

    Write-Host "📸 現在の画面を撮影中: $fileName ..." -ForegroundColor Cyan
    & $adbPath shell screencap -p $remotePath
    & $adbPath pull $remotePath $localPath | Out-Null
    & $adbPath shell rm $remotePath
}

Write-Host "✨ スクリーンショットの取得が完了しました！" -ForegroundColor Green
Get-ChildItem -Path $screenshotsDir -Filter "*.png" | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize
