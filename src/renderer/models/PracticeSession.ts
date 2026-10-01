import { makeAutoObservable, runInAction } from 'mobx';
import type { WorkspaceRef } from '@shared/api';
import { EMPTY_REPO, type FileState, type RepoSnapshot } from '@shared/repo';
import type { SetupStep } from '@shared/setup';
import type { ProjectTemplate } from '@data/projects';
import { TerminalModel } from './TerminalModel';
import { WorkspaceModel } from './WorkspaceModel';

/**
 * 練習用リポジトリ1つぶんの状態（エディタ・ターミナル・コミットグラフ・ファイルの居場所）。
 * コマンドを実行するたびにリポジトリとファイルを読み直す。
 */
export class PracticeSession {
  repo: RepoSnapshot = EMPTY_REPO;
  ready = false;
  readonly terminal: TerminalModel;
  readonly workspace: WorkspaceModel;

  constructor(
    readonly ref: WorkspaceRef,
    private readonly project: ProjectTemplate,
    /** 練習用リポジトリの初期状態（リセットでもこれを使う） */
    private readonly setup: SetupStep[],
  ) {
    this.workspace = new WorkspaceModel(ref, [project.featureFile, project.mainFile]);
    this.terminal = new TerminalModel(ref, {
      beforeExecute: () => this.workspace.flush(),
      afterExecute: () => void this.refresh(),
    });
    makeAutoObservable<PracticeSession, 'project' | 'setup'>(this, {
      ref: false,
      project: false,
      setup: false,
      terminal: false,
      workspace: false,
    });
  }

  get displayName(): string {
    return this.project.name;
  }

  /** エディタやツリーに出す、ファイルごとの Git 上の状態 */
  get fileStates(): Map<string, FileState> {
    const states = new Map<string, FileState>();
    for (const f of this.repo.staged) states.set(f.path, f.state);
    for (const f of this.repo.working) states.set(f.path, f.state);
    return states;
  }

  async open(): Promise<void> {
    if (!window.gitGym) return;
    const info = await window.gitGym.workspace.open(this.ref, this.project.name, this.setup);
    this.terminal.setCwd(info.cwd);
    await Promise.all([this.workspace.load(), this.refreshRepo()]);
    runInAction(() => (this.ready = true));
  }

  /** git の実行後など、ディスクの状態をまとめて読み直す */
  async refresh(): Promise<void> {
    await Promise.all([this.workspace.syncFromDisk(), this.refreshRepo()]);
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

  private async refreshRepo(): Promise<void> {
    if (!window.gitGym) return;
    const repo = await window.gitGym.repo.snapshot(this.ref);
    runInAction(() => (this.repo = repo));
  }
}
