import { app } from 'electron';
import { existsSync } from 'fs';
import * as path from 'path';

/**
 * 使う git の実行ファイルを決める。
 * アプリに同梱した git（Windows は MinGit）を優先し、無ければ PC に入っている git を使う。
 */
export function resolveGitPath(): string {
  const exe = process.platform === 'win32' ? 'git.exe' : 'git';
  const base = app.isPackaged ? process.resourcesPath : path.join(app.getAppPath(), '..', '..', 'resources');
  const candidates = [path.join(base, 'git', 'cmd', exe), path.join(base, 'git', 'bin', exe)];

  return candidates.find((p) => existsSync(p)) ?? 'git';
}
