#!/usr/bin/env node

/**
 * sync.js
 * agentic-dev-platform の core/ および stacks/<stack>/ を各対象リポジトリに合成・配信するスクリプト。
 * 外部依存なし (Node.js 標準モジュールのみで動作)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const CONFIG_FILE = path.join(ROOT_DIR, 'config', 'repositories.json');
const CORE_DIR = path.join(ROOT_DIR, 'core');
const STACKS_DIR = path.join(ROOT_DIR, 'stacks');

// 引数パース
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: false,
    outputDir: null,
    repo: null,
    createPr: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--create-pr') {
      options.createPr = true;
    } else if (arg === '--output-dir' && i + 1 < args.length) {
      options.outputDir = path.resolve(args[++i]);
    } else if (arg === '--repo' && i + 1 < args.length) {
      options.repo = args[++i];
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
使用方法: node scripts/sync.js [オプション]

オプション:
  --dry-run             変更を適用せず、合成されるファイル一覧と内容をプレビュー表示します
  --output-dir <path>   指定したローカルディレクトリに合成結果を出力します
  --repo <repo_name>    特定のリポジトリ (例: asabon/agentic-sandbox-android) のみを対象に実行します
  --create-pr           対象リポジトリを clone し、トピックブランチ作成・コミット・プッシュ・PR 発行を行います
  --help, -h            このヘルプを表示します
`);
}

// 再帰的にディレクトリ内のファイル一覧を取得
function getAllFiles(dir, baseDir = dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  const list = fs.readdirSync(dir);
  for (const item of list) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    if (stat.isDirectory()) {
      results = results.concat(getAllFiles(itemPath, baseDir));
    } else {
      results.push({
        fullPath: itemPath,
        relPath: path.relative(baseDir, itemPath).replace(/\\/g, '/'),
      });
    }
  }
  return results;
}

// AGENTS.md の合成生成
function generateAgentsMd(repoName, stackName) {
  const repoBasename = repoName.split('/')[1] || repoName;
  const sections = [];

  sections.push(`# Antigravity 開発ガイドライン (${repoBasename})

本リポジトリにおけるエージェント開発環境および開発ルールです。
本ファイルは [agentic-dev-platform](https://github.com/asabon/agentic-dev-platform) から自動生成・同期されています。

---
`);

  // 1. Core ルールの読み込み
  const coreRulesDir = path.join(CORE_DIR, 'rules');
  if (fs.existsSync(coreRulesDir)) {
    const coreRuleFiles = fs.readdirSync(coreRulesDir).filter((f) => f.endsWith('.md')).sort();
    for (const file of coreRuleFiles) {
      const content = fs.readFileSync(path.join(coreRulesDir, file), 'utf8');
      sections.push(content.trim());
      sections.push('\n---\n');
    }
  }

  // 2. Stack ルールの読み込み
  const stackRulesDir = path.join(STACKS_DIR, stackName, 'rules');
  if (fs.existsSync(stackRulesDir)) {
    const stackRuleFiles = fs.readdirSync(stackRulesDir).filter((f) => f.endsWith('.md')).sort();
    for (const file of stackRuleFiles) {
      const content = fs.readFileSync(path.join(stackRulesDir, file), 'utf8');
      sections.push(content.trim());
      sections.push('\n---\n');
    }
  }

  return sections.join('\n').trim() + '\n';
}

// アセットの合成マップを作成
function buildAssetMap(repoConfig) {
  const { repo, stack, custom_excludes = [] } = repoConfig;
  const assetMap = new Map(); // relPath -> { type: 'file'|'content', sourcePath?: string, content?: string }

  // 1. core/ のアセット追加
  const coreFiles = getAllFiles(CORE_DIR);
  for (const f of coreFiles) {
    // rules は AGENTS.md に統合するため個別コピーはスキップ
    if (f.relPath.startsWith('rules/')) continue;
    assetMap.set(f.relPath, { type: 'file', sourcePath: f.fullPath });
  }

  // 2. stacks/<stack>/ のアセット追加 (上書き)
  const stackDir = path.join(STACKS_DIR, stack);
  if (fs.existsSync(stackDir)) {
    const stackFiles = getAllFiles(stackDir);
    for (const f of stackFiles) {
      if (f.relPath.startsWith('rules/')) continue;
      assetMap.set(f.relPath, { type: 'file', sourcePath: f.fullPath });
    }
  }

  // 3. AGENTS.md の追加
  const agentsMdContent = generateAgentsMd(repo, stack);
  assetMap.set('AGENTS.md', { type: 'content', content: agentsMdContent });

  // 4. 除外パターンの適用
  for (const exclude of custom_excludes) {
    for (const key of assetMap.keys()) {
      if (key === exclude || key.startsWith(exclude + '/')) {
        assetMap.delete(key);
      }
    }
  }

  return assetMap;
}

// 指定ディレクトリへアセットを展開
function writeAssetsToDir(targetDir, assetMap) {
  for (const [relPath, asset] of assetMap.entries()) {
    const destPath = path.join(targetDir, relPath);
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    if (asset.type === 'file') {
      fs.copyFileSync(asset.sourcePath, destPath);
    } else if (asset.type === 'content') {
      fs.writeFileSync(destPath, asset.content, 'utf8');
    }
  }
}

// PR 作成処理
function syncToRemoteRepo(repoConfig, assetMap) {
  const { repo, branch = 'main', stack } = repoConfig;
  console.log(`\n🚀 [${repo}] 同期処理を開始します (Stack: ${stack}, Base Branch: ${branch})`);

  const tempDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'agentic-sync-'));
  const repoDir = path.join(tempDir, 'repo');

  try {
    // 1. Clone
    console.log(`📦 リポジトリをクローン中: ${repo} ...`);
    execSync(`gh repo clone ${repo} "${repoDir}" -- --depth 1 -b ${branch}`, { stdio: 'inherit' });

    // 2. 合成アセットを展開
    console.log(`📝 アセットを合成展開中 ...`);
    writeAssetsToDir(repoDir, assetMap);

    // 3. 差分チェック (git add を先に行い改行コード等を正規化した上で差分判定)
    execSync('git add -A', { cwd: repoDir, stdio: 'inherit' });
    const status = execSync('git status --porcelain', { cwd: repoDir, encoding: 'utf8' }).trim();
    if (!status) {
      console.log(`✅ [${repo}] 変更差分はありません。スキップします。`);
      return;
    }

    console.log(`🔍 差分を検知しました:\n${status}`);

    // 4. トピックブランチ作成
    const dateStr = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 8);
    const branchName = `chore/sync-agentic-platform-${dateStr}`;

    execSync(`git switch -c ${branchName}`, { cwd: repoDir, stdio: 'inherit' });
    execSync('git commit -m "chore: エージェント開発環境の自動同期 (agentic-dev-platform)"', {
      cwd: repoDir,
      stdio: 'inherit',
    });

    // 5. Push
    console.log(`📤 ブランチをリモートへプッシュ中: ${branchName} ...`);
    execSync(`git push -u origin ${branchName} --force`, { cwd: repoDir, stdio: 'inherit' });

    // 6. PR 本文作成 & 発行
    const prBodyFile = path.join(tempDir, 'pr_body.md');
    const prBody = `## 概要 / Overview
[agentic-dev-platform](https://github.com/asabon/agentic-dev-platform) からエージェント開発環境（ルール、スキル、Git Hooks、各種テンプレート）の最新アセットを自動同期しました。

## 適用スタック
- **Stack**: \`${stack}\`
- **対象ブランチ**: \`${branch}\`

## 主な同期内容
- \`AGENTS.md\`: 共通ルールおよびスタックルールの統合生成
- \`.agents/skills/\`: 最新スキルの同期
- \`.githooks/\`: 誤操作防止 Git Hooks の同期
- 各種テンプレート（Issue, PR）の同期

## 確認事項
- 内容をご確認の上、問題がなければマージしてください。
`;
    fs.writeFileSync(prBodyFile, prBody, 'utf8');

    console.log(`📬 Pull Request を作成中 ...`);
    const prOutput = execSync(
      `gh pr create --repo ${repo} --title "chore: エージェント開発環境の自動同期 (${stack})" --body-file "${prBodyFile}" --base ${branch} --head ${branchName}`,
      { cwd: repoDir, encoding: 'utf8' }
    ).trim();

    console.log(`✨ PR が作成されました: ${prOutput}`);
  } catch (err) {
    console.error(`❌ [${repo}] 同期中にエラーが発生しました:`, err.message);
    throw err;
  } finally {
    // クリーンアップ
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (_) {}
  }
}

// メイン実行
function main() {
  const options = parseArgs();
  if (options.help) {
    showHelp();
    return;
  }

  if (!fs.existsSync(CONFIG_FILE)) {
    console.error(`❌ 設定ファイルが見つかりません: ${CONFIG_FILE}`);
    process.exit(1);
  }

  const repositories = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  const targetRepos = options.repo
    ? repositories.filter((r) => r.repo === options.repo)
    : repositories;

  if (targetRepos.length === 0) {
    console.error(`❌ 対象リポジトリが見つかりません: ${options.repo || 'repositories.json が空です'}`);
    process.exit(1);
  }

  console.log(`====================================================`);
  console.log(` Agentic Dev Platform - 同期エンジン`);
  console.log(` 対象リポジトリ数: ${targetRepos.length}`);
  console.log(` モード: ${options.dryRun ? 'ドライラン' : options.createPr ? 'PR自動作成' : options.outputDir ? 'ローカル出力' : '合成プレビュー'}`);
  console.log(`====================================================\n`);

  for (const repoConfig of targetRepos) {
    console.log(`📦 リポジトリ: ${repoConfig.repo} (Stack: ${repoConfig.stack})`);
    const assetMap = buildAssetMap(repoConfig);

    console.log(`  📄 合成アセット数: ${assetMap.size} 件`);
    for (const [relPath, asset] of assetMap.entries()) {
      console.log(`    - ${relPath} (${asset.type === 'file' ? 'ファイル' : '生成コンテンツ'})`);
    }

    if (options.dryRun) {
      console.log(`\n  --- AGENTS.md プレビュー (先頭 20 行) ---`);
      const agentsMd = assetMap.get('AGENTS.md')?.content || '';
      const previewLines = agentsMd.split('\n').slice(0, 20).join('\n');
      console.log(previewLines);
      console.log(`  -----------------------------------------\n`);
    } else if (options.outputDir) {
      const targetDir = targetRepos.length > 1
        ? path.join(options.outputDir, repoConfig.repo.replace('/', '_'))
        : options.outputDir;
      console.log(`  💾 出力先: ${targetDir}`);
      writeAssetsToDir(targetDir, assetMap);
      console.log(`  ✅ 出力完了`);
    } else if (options.createPr) {
      syncToRemoteRepo(repoConfig, assetMap);
    }
  }

  console.log(`\n🎉 全ての処理が完了しました！`);
}

main();
