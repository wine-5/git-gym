import { makeAutoObservable, runInAction } from 'mobx';
import type { WorkspaceRef } from '@shared/api';
import type { CommandResult } from '@shared/terminal';

export interface TerminalHooks {
  /** 実行前に呼ばれる（エディタの保存待ちを書き込むなど） */
  beforeExecute?: () => Promise<void>;
  /** 実行後に呼ばれる（リポジトリ状態の再読み込みなど） */
  afterExecute?: (line: string, result: CommandResult) => void;
}

export interface TerminalLine {
  kind: 'command' | 'output' | 'error' | 'success' | 'hint';
  text: string;
  /** command のときのプロンプト表示 */
  cwd?: string;
  branch?: string;
}

/** 1つの練習用リポジトリに紐づくターミナルの状態 */
export class TerminalModel {
  lines: TerminalLine[] = [];
  cwd = '';
  running = false;
  private history: string[] = [];
  private historyIndex = 0;

  constructor(
    readonly ref: WorkspaceRef,
    private readonly hooks: TerminalHooks = {},
  ) {
    makeAutoObservable<TerminalModel, 'hooks'>(this, { ref: false, hooks: false });
  }

  setCwd(cwd: string): void {
    this.cwd = cwd;
  }

  async execute(line: string, branch?: string): Promise<void> {
    const trimmed = line.trim();
    if (!trimmed || this.running) return;

    this.history.push(trimmed);
    this.historyIndex = this.history.length;
    this.lines.push({ kind: 'command', text: trimmed, cwd: this.cwd, branch });
    this.running = true;

    let result: CommandResult;
    try {
      await this.hooks.beforeExecute?.();
      result = await window.gitGym.terminal.execute(this.ref, trimmed);
    } catch (e) {
      result = { stdout: '', stderr: `${(e as Error).message}\n`, exitCode: 1, cwd: this.cwd };
    }

    runInAction(() => {
      this.running = false;
      this.cwd = result.cwd;
      if (result.clear) {
        this.lines = [];
      } else {
        this.push('output', result.stdout);
        // git は成功時の案内も stderr に出すので、失敗したときだけエラー表示にする
        this.push(result.exitCode === 0 ? 'output' : 'error', result.stderr);
      }
    });
    this.hooks.afterExecute?.(trimmed, result);
  }

  /** フィードバックやヒントを差し込む */
  push(kind: TerminalLine['kind'], text: string): void {
    const body = text.replace(/\n+$/, '');
    if (body) this.lines.push({ kind, text: body });
  }

  clear(): void {
    this.lines = [];
  }

  /** ↑↓キーで履歴をたどる。返り値を入力欄に入れる */
  previous(): string {
    this.historyIndex = Math.max(0, this.historyIndex - 1);
    return this.history[this.historyIndex] ?? '';
  }

  next(): string {
    this.historyIndex = Math.min(this.history.length, this.historyIndex + 1);
    return this.history[this.historyIndex] ?? '';
  }
}
