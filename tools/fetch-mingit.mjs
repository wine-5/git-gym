// Windows 版に同梱する MinGit（ポータブル版の Git for Windows）を resources/git に用意する
//   node tools/fetch-mingit.mjs
// 学生の PC に Git が入っていなくても動くようにするため。Mac では PC の git（Xcode Command Line Tools）を使う。
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dest = path.join(root, 'resources', 'git');

if (existsSync(path.join(dest, 'cmd', 'git.exe')) && !process.argv.includes('--force')) {
  console.log('MinGit はすでにあります（作り直すときは --force）');
  process.exit(0);
}

const headers = { 'User-Agent': 'git-gym', Accept: 'application/vnd.github+json' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const release = await (await fetch('https://api.github.com/repos/git-for-windows/git/releases/latest', { headers })).json();
const asset = release.assets?.find((a) => /^MinGit-[\d.]+-64-bit\.zip$/.test(a.name));
if (!asset) throw new Error('MinGit の 64bit 版が見つかりませんでした');

console.log(`ダウンロード: ${asset.name}`);
const zip = path.join(os.tmpdir(), asset.name);
writeFileSync(zip, Buffer.from(await (await fetch(asset.browser_download_url)).arrayBuffer()));

rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
// Windows 10 以降に入っている tar（bsdtar）は zip も展開できる。
// Git Bash の GNU tar が先に見つかると「C:」をホスト名と誤解するので、System32 のものを使う
const tar = process.platform === 'win32' ? path.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'tar.exe') : 'tar';
execFileSync(tar, ['-xf', zip, '-C', dest], { stdio: 'inherit' });
rmSync(zip, { force: true });

console.log(`展開しました: ${path.relative(root, dest)}（${release.tag_name}）`);
