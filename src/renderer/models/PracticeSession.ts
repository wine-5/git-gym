import { makeAutoObservable, runInAction } from 'mobx';
import type { WorkspaceRef } from '@shared/api';
import { EMPTY_REPO, type RepoSnapshot } from '@shared/repo';
import { TerminalModel } from './TerminalModel';

/**
 * 練習用リポジトリ1つぶんの状態（ターミナル・コミットグラフ・ファイルの居場所）。
 * コマンドを実行するたびにリポジトリを読み直す。
 */
export class PracticeSession {
  repo: RepoSnapshot = EMPTY_REPO;
  ready = false;
  readonly terminal: TerminalModel;

  constructor(
    readonly ref: WorkspaceRef,
    readonly displayName: string,
  ) {
    this.terminal = new TerminalModel(ref, () => void this.refresh());
    makeAutoObservable(this, { ref: false, displayName: false, terminal: false });
  }

  async open(): Promise<void> {
    if (!window.gitGym) return;
    const info = await window.gitGym.workspace.open(this.ref, this.displayName);
    this.terminal.setCwd(info.cwd);
    await this.refresh();
    runInAction(() => (this.ready = true));
  }

  async refresh(): Promise<void> {
    if (!window.gitGym) return;
    const repo = await window.gitGym.repo.snapshot(this.ref);
    runInAction(() => (this.repo = repo));
  }

  async reset(): Promise<void> {
    if (!window.gitGym) return;
    const info = await window.gitGym.workspace.reset(this.ref);
    this.terminal.clear();
    this.terminal.setCwd(info.cwd);
    await this.refresh();
  }

  reveal(): void {
    void window.gitGym?.workspace.reveal(this.ref);
  }
}
