import { makeAutoObservable, runInAction } from 'mobx';
import type { WorkspaceRef } from '@shared/api';

const SAVE_DELAY_MS = 300;

/**
 * エディタで開いている練習用リポジトリのファイル群。
 * 実フォルダが正で、編集は少し待ってから自動保存し、git の実行後はディスクから読み直す。
 */
export class WorkspaceModel {
  files = new Map<string, string>();
  openTabs: string[] = [];
  activePath: string | null = null;
  private readonly pending = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(
    private readonly ref: WorkspaceRef,
    /** 最初に開いておくタブ */
    private readonly defaultTabs: string[],
  ) {
    makeAutoObservable<WorkspaceModel, 'ref' | 'defaultTabs' | 'pending'>(this, {
      ref: false,
      defaultTabs: false,
      pending: false,
    });
  }

  get paths(): string[] {
    return [...this.files.keys()].sort((a, b) => a.localeCompare(b));
  }

  get activeContent(): string {
    return this.activePath ? this.files.get(this.activePath) ?? '' : '';
  }

  async load(): Promise<void> {
    await this.syncFromDisk();
    runInAction(() => {
      this.openTabs = this.defaultTabs.filter((p) => this.files.has(p));
      this.activePath = this.openTabs[0] ?? null;
    });
  }

  /** git switch / restore などでファイルが変わったときに読み直す。保存待ちのファイルは上書きしない */
  async syncFromDisk(): Promise<void> {
    const api = window.gitGym;
    if (!api) return;
    const paths = await api.files.list(this.ref);
    const contents = await Promise.all(paths.map((p) => api.files.read(this.ref, p)));

    runInAction(() => {
      const next = new Map<string, string>();
      paths.forEach((p, i) => {
        const content = contents[i];
        if (content === null) return;
        next.set(p, this.pending.has(p) ? this.files.get(p) ?? content : content);
      });
      this.files = next;
      this.openTabs = this.openTabs.filter((p) => next.has(p));
      if (this.activePath && !next.has(this.activePath)) this.activePath = this.openTabs[0] ?? null;
    });
  }

  open(path: string): void {
    if (!this.openTabs.includes(path)) this.openTabs.push(path);
    this.activePath = path;
  }

  close(path: string): void {
    const index = this.openTabs.indexOf(path);
    if (index < 0) return;
    this.openTabs.splice(index, 1);
    if (this.activePath === path) {
      this.activePath = this.openTabs[Math.min(index, this.openTabs.length - 1)] ?? null;
    }
  }

  update(path: string, content: string): void {
    if (this.files.get(path) === content) return;
    this.files.set(path, content);
    clearTimeout(this.pending.get(path));
    this.pending.set(
      path,
      setTimeout(() => void this.save(path), SAVE_DELAY_MS),
    );
  }

  /** 保存待ちを今すぐ書き込む（コマンド実行前に呼ぶ） */
  async flush(): Promise<void> {
    await Promise.all([...this.pending.keys()].map((p) => this.save(p)));
  }

  private async save(path: string): Promise<void> {
    clearTimeout(this.pending.get(path));
    this.pending.delete(path);
    const content = this.files.get(path);
    if (content !== undefined) await window.gitGym?.files.write(this.ref, path, content);
  }
}
