import { makeAutoObservable } from 'mobx';

const KEY = 'git-gym.layout';

interface LayoutData {
  terminalOpen: boolean;
  explorerOpen: boolean;
  sideOpen: boolean;
}

const DEFAULTS: LayoutData = { terminalOpen: true, explorerOpen: true, sideOpen: true };

/** VS Code のように開け閉めできるパネル（ターミナル・ファイル一覧・右の欄）の状態 */
export class LayoutModel {
  terminalOpen: boolean;
  explorerOpen: boolean;
  sideOpen: boolean;

  constructor() {
    let data = DEFAULTS;
    try {
      data = { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<LayoutData>) };
    } catch {
      // 読めなければ全部開いた状態にする
    }
    this.terminalOpen = data.terminalOpen;
    this.explorerOpen = data.explorerOpen;
    this.sideOpen = data.sideOpen;
    makeAutoObservable(this);
  }

  setTerminalOpen(open: boolean): void {
    this.terminalOpen = open;
    this.save();
  }

  toggleTerminal(): void {
    this.setTerminalOpen(!this.terminalOpen);
  }

  setExplorerOpen(open: boolean): void {
    this.explorerOpen = open;
    this.save();
  }

  toggleExplorer(): void {
    this.setExplorerOpen(!this.explorerOpen);
  }

  toggleSide(): void {
    this.sideOpen = !this.sideOpen;
    this.save();
  }

  private save(): void {
    try {
      const data: LayoutData = { terminalOpen: this.terminalOpen, explorerOpen: this.explorerOpen, sideOpen: this.sideOpen };
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      // 保存できなくても今回は使える
    }
  }
}
