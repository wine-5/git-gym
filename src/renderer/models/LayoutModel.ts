import { makeAutoObservable } from 'mobx';

const KEY = 'git-gym.layout';

/** 練習画面のパネル。Unity のエディタのように、ドラッグで自由に配置できる */
export type DockPanelId = 'mission' | 'files' | 'editor' | 'terminal' | 'graph' | 'areas';

/** 閉じられるパネル（ミッションとエディタは常に出しておく） */
export type ClosablePanelId = 'files' | 'terminal' | 'graph' | 'areas';

type LayoutData = Record<ClosablePanelId, boolean>;

const DEFAULTS: LayoutData = { files: true, terminal: true, graph: true, areas: true };

/**
 * VS Code のように開け閉めできるパネル（ターミナル・ファイル一覧・コミットグラフ・ファイルの居場所）の状態。
 * パネルの配置そのものは PracticeDock が dockview の形式で保存する
 */
export class LayoutModel {
  open: LayoutData;
  /** 配置を最初の状態に戻すよう頼まれた回数（PracticeDock がこれを見て並べ直す） */
  dockResetCount = 0;

  constructor() {
    let data = DEFAULTS;
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<LayoutData>;
      data = { ...DEFAULTS, ...saved };
    } catch {
      // 読めなければ全部開いた状態にする
    }
    this.open = { files: data.files, terminal: data.terminal, graph: data.graph, areas: data.areas };
    makeAutoObservable(this);
  }

  get terminalOpen(): boolean {
    return this.open.terminal;
  }

  get explorerOpen(): boolean {
    return this.open.files;
  }

  /** 右の欄（コミットグラフ・ファイルの居場所）のどちらかが開いているか */
  get sideOpen(): boolean {
    return this.open.graph || this.open.areas;
  }

  isPanelOpen(panel: DockPanelId): boolean {
    return panel === 'mission' || panel === 'editor' ? true : this.open[panel];
  }

  setPanelOpen(panel: ClosablePanelId, open: boolean): void {
    if (this.open[panel] === open) return;
    this.open = { ...this.open, [panel]: open };
    this.save();
  }

  /** パネルの配置を最初の状態に戻す（閉じていたパネルも開く） */
  resetDock(): void {
    this.open = { ...DEFAULTS };
    this.save();
    this.dockResetCount++;
  }

  setTerminalOpen(open: boolean): void {
    this.setPanelOpen('terminal', open);
  }

  toggleTerminal(): void {
    this.setTerminalOpen(!this.terminalOpen);
  }

  setExplorerOpen(open: boolean): void {
    this.setPanelOpen('files', open);
  }

  toggleExplorer(): void {
    this.setExplorerOpen(!this.explorerOpen);
  }

  /** Ctrl+Alt+B：右の欄をまとめて開け閉めする */
  toggleSide(): void {
    const open = !this.sideOpen;
    this.open = { ...this.open, graph: open, areas: open };
    this.save();
  }

  private save(): void {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.open));
    } catch {
      // 保存できなくても今回は使える
    }
  }
}
