import type { WorkspaceRef } from '@shared/api';
import type { RepoSnapshot } from '@shared/repo';

/**
 * レッスンの達成判定で使う、リポジトリへの問い合わせ。
 * 打ったコマンドの文字列ではなく、結果としてのリポジトリの状態で判定する。
 */
export class RepoQuery {
  constructor(
    private readonly ref: WorkspaceRef,
    /** 直前に読んだ状態（status / log の結果） */
    readonly snapshot: RepoSnapshot,
  ) {}

  get isRepo(): boolean {
    return this.snapshot.initialized;
  }

  get currentBranch(): string | null {
    return this.snapshot.branch;
  }

  get commitCount(): number {
    return this.snapshot.commits.length;
  }

  /** 作業ツリーにもステージにも変更が無い */
  get isClean(): boolean {
    return this.snapshot.working.length === 0 && this.snapshot.staged.length === 0;
  }

  isStaged(path: string): boolean {
    return this.snapshot.staged.some((f) => f.path === path);
  }

  isUntracked(path: string): boolean {
    return this.snapshot.working.some((f) => f.path === path && f.state === 'untracked');
  }

  isModified(path: string): boolean {
    return this.snapshot.working.some((f) => f.path === path && f.state !== 'untracked');
  }

  async branches(): Promise<string[]> {
    return this.lines(['branch', '--format=%(refname:short)']);
  }

  async hasBranch(name: string): Promise<boolean> {
    return (await this.branches()).includes(name);
  }

  async remoteBranches(): Promise<string[]> {
    return this.lines(['branch', '-r', '--format=%(refname:short)']);
  }

  async tags(): Promise<string[]> {
    return this.lines(['tag', '--list']);
  }

  async remotes(): Promise<string[]> {
    return this.lines(['remote']);
  }

  async isTracked(path: string): Promise<boolean> {
    return (await this.lines(['ls-files', '--', path])).length > 0;
  }

  /** rev のコミット数 */
  async countCommits(rev = 'HEAD'): Promise<number> {
    const out = await this.run(['rev-list', '--count', rev]);
    return out === null ? 0 : Number(out.trim());
  }

  /** rev のコミットで変更されたファイル */
  async changedFiles(rev = 'HEAD'): Promise<string[]> {
    return this.lines(['show', '--name-only', '--format=', rev]);
  }

  /** rev の時点でのファイルの中身（無ければ null） */
  async fileAt(rev: string, path: string): Promise<string | null> {
    return this.run(['show', `${rev}:${path}`]);
  }

  async message(rev = 'HEAD'): Promise<string | null> {
    const out = await this.run(['log', '-1', '--format=%s', rev]);
    return out === null ? null : out.trim();
  }

  async parentCount(rev = 'HEAD'): Promise<number> {
    const out = await this.run(['log', '-1', '--format=%p', rev]);
    return out === null ? 0 : out.trim().split(' ').filter(Boolean).length;
  }

  /** branch の内容がすべて target に取り込まれているか */
  async isMergedInto(branch: string, target: string): Promise<boolean> {
    const out = await this.run(['rev-list', '--count', `${target}..${branch}`]);
    return out !== null && Number(out.trim()) === 0;
  }

  /** ローカルとリモート追跡ブランチの差（ahead / behind） */
  async aheadBehind(branch: string, upstream: string): Promise<{ ahead: number; behind: number } | null> {
    const out = await this.run(['rev-list', '--left-right', '--count', `${branch}...${upstream}`]);
    if (out === null) return null;
    const [ahead, behind] = out.trim().split(/\s+/).map(Number);
    return { ahead, behind };
  }

  async upstreamOf(branch: string): Promise<string | null> {
    const out = await this.run(['rev-parse', '--abbrev-ref', `${branch}@{upstream}`]);
    return out === null ? null : out.trim();
  }

  async stashCount(): Promise<number> {
    return (await this.lines(['stash', 'list'])).length;
  }

  async config(key: string): Promise<string | null> {
    const out = await this.run(['config', '--get', key]);
    return out === null ? null : out.trim();
  }

  /** 失敗したら null */
  async run(args: string[]): Promise<string | null> {
    if (!window.gitGym) return null;
    const result = await window.gitGym.repo.query(this.ref, args);
    return result.exitCode === 0 ? result.stdout : null;
  }

  private async lines(args: string[]): Promise<string[]> {
    const out = await this.run(args);
    return out === null ? [] : out.split('\n').map((l) => l.trim()).filter(Boolean);
  }
}
