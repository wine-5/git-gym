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
  kind: 'command' | 'output' | 'success' | 'hint';
  /** output は git などの出力そのまま（色の指定を含む） */
  text: string;
  /** command のときのプロンプト表示 */
  cwd?: string;
  branch?: string;
  /** command の終了コード（実行中は undefined）。VS Code と同じく左に成功・失敗の印を出す */
  exitCode?: number;
}

/**
 * 打ったコマンドの履歴。レッスンやステージをまたいでも ↑ で戻れるよう、全ターミナルで共有する。
 * メモリにだけ持つので、アプリを閉じると消える
 */
const sharedHistory: string[] = [];

/** 1つの練習用リポジトリに紐づくターミナルの状態 */
export class TerminalModel {
  lines: TerminalLine[] = [];
  cwd = '';
  running = false;
  /** 連続で成功したコマンドの数（失敗すると 0 に戻る） */
  streak = 0;
  private readonly history = sharedHistory;
  private historyIndex = sharedHistory.length;

  constructor(
    readonly ref: WorkspaceRef,
    private readonly hooks: TerminalHooks = {},
  ) {
    makeAutoObservable<TerminalModel, 'hooks' | 'history'>(this, { ref: false, hooks: false, history: false });
  }

  setCwd(cwd: string): void {
    this.cwd = cwd;
  }

  async execute(line: string, branch?: string): Promise<void> {
    const trimmed = line.trim();
    if (!trimmed || this.running) return;

    // 同じコマンドを続けて打ったときは1つにまとめる（シェルの ignoredups と同じ）
    if (this.history[this.history.length - 1] !== trimmed) this.history.push(trimmed);
    this.historyIndex = this.history.length;
    this.lines.push({ kind: 'command', text: trimmed, cwd: this.cwd, branch, exitCode: undefined });
    const commandLine = this.lines[this.lines.length - 1];
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
      this.streak = result.exitCode === 0 ? this.streak + 1 : 0;
      commandLine.exitCode = result.exitCode;
      if (result.clear) {
        this.lines = [];
      } else {
        // 本物のターミナルと同じく stderr も同じ見た目で出す（失敗はコマンド行の印で分かる）
        this.push('output', result.stdout);
        this.push('output', result.stderr);
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
