import * as path from 'path';
import { EMPTY_REPO, type RepoSnapshot } from '../../shared/repo';
import type { GitRunner } from './GitRunner';
import { LOG_ARGS, parseLog } from './parseLog';
import { STATUS_ARGS, parseStatus } from './parseStatus';

/** 練習用フォルダのリポジトリ状態（グラフ・ファイルの居場所）をまとめて読む */
export async function readRepo(git: GitRunner, dir: string, env: Record<string, string>): Promise<RepoSnapshot> {
  // 親フォルダのリポジトリを拾わないよう、このフォルダ自身がリポジトリのときだけ読む
  const top = await git.run(['rev-parse', '--show-toplevel'], dir, { env });
  if (top.exitCode !== 0 || path.resolve(top.stdout.trim()) !== path.resolve(dir)) {
    return EMPTY_REPO;
  }

  const [status, log] = await Promise.all([
    git.run(STATUS_ARGS, dir, { env }),
    git.run(LOG_ARGS, dir, { env }),
  ]);
  const parsed = parseStatus(status.stdout);

  return {
    initialized: true,
    branch: parsed.branch,
    // コミットが1つも無いと git log は失敗するので空にする
    commits: log.exitCode === 0 ? parseLog(log.stdout) : [],
    working: parsed.working,
    staged: parsed.staged,
  };
}
