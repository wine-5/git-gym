import { promises as fs } from 'fs';
import type { SetupStep } from '../../shared/setup';
import type { GitRunner } from '../git/GitRunner';
import { writeFile } from './repoFiles';

export interface SetupContext {
  /** 練習用リポジトリ */
  dir: string;
  /** origin として使う bare リポジトリ */
  remoteDir: string;
  /** チームメイトの作業用（使い終わったら消す） */
  scratchDir: string;
  git: GitRunner;
  env: Record<string, string>;
}

const TEAMMATE = ['-c', 'user.name=チームメイト', '-c', 'user.email=teammate@git-gym.local'];

/** レッスンの初期状態を上から順に組み立てる。失敗したらその場で止める */
export async function runSetup(steps: SetupStep[], ctx: SetupContext): Promise<void> {
  for (const step of steps) {
    switch (step.kind) {
      case 'write':
        await writeFile(ctx.dir, step.path, step.content);
        break;
      case 'delete':
        await fs.rm(`${ctx.dir}/${step.path}`, { force: true });
        break;
      case 'git':
        await git(ctx, ctx.dir, step.args);
        break;
      case 'remote':
        await fs.rm(ctx.remoteDir, { recursive: true, force: true });
        await fs.mkdir(ctx.remoteDir, { recursive: true });
        await git(ctx, ctx.remoteDir, ['init', '--bare', '-b', 'main']);
        await git(ctx, ctx.dir, ['remote', 'add', step.name ?? 'origin', toUrl(ctx.remoteDir)]);
        break;
      case 'teammate':
        await pushAsTeammate(ctx, step.message, step.files);
        break;
    }
  }
}

async function pushAsTeammate(ctx: SetupContext, message: string, files: { path: string; content: string }[]) {
  await fs.rm(ctx.scratchDir, { recursive: true, force: true });
  try {
    await git(ctx, '.', ['clone', toUrl(ctx.remoteDir), ctx.scratchDir]);
    for (const file of files) await writeFile(ctx.scratchDir, file.path, file.content);
    await git(ctx, ctx.scratchDir, ['add', '-A']);
    await git(ctx, ctx.scratchDir, [...TEAMMATE, 'commit', '-m', message]);
    await git(ctx, ctx.scratchDir, ['push', 'origin', 'HEAD']);
  } finally {
    await fs.rm(ctx.scratchDir, { recursive: true, force: true });
  }
}

async function git(ctx: SetupContext, cwd: string, args: string[]): Promise<void> {
  const result = await ctx.git.run(args, cwd === '.' ? ctx.dir : cwd, { env: ctx.env, timeoutMs: 20_000 });
  if (result.exitCode !== 0) {
    throw new Error(`レッスンの準備に失敗しました: git ${args.join(' ')}\n${result.stderr}`);
  }
}

/** Windows のパスでも git が読めるよう / 区切りにする */
function toUrl(dir: string): string {
  return dir.split('\\').join('/');
}
