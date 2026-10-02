import { makeAutoObservable } from 'mobx';

const KEY = 'git-gym.layout';

/** パネルを置ける場所（左の欄・ファイル一覧の場所・下・右上・右下） */
export type DockSlotId = 'left' | 'tree' | 'bottom' | 'sideTop' | 'sideBottom';
/** 場所を入れ替えられるパネル */
export type DockPanelId = 'mission' | 'files' | 'terminal' | 'graph' | 'areas';
export type DockLayout = Record<DockSlotId, DockPanelId>;

export const DOCK_SLOTS: DockSlotId[] = ['left', 'tree', 'bottom', 'sideTop', 'sideBottom'];
const DEFAULT_DOCK: DockLayout = { left: 'mission', tree: 'files', bottom: 'terminal', sideTop: 'graph', sideBottom: 'areas' };

interface LayoutData {
  terminalOpen: boolean;
  explorerOpen: boolean;
  sideOpen: boolean;
  dock: DockLayout;
}

const DEFAULTS: LayoutData = { terminalOpen: true, explorerOpen: true, sideOpen: true, dock: DEFAULT_DOCK };

/** 保存されていた配置が、5つのパネルを1つずつ置いた形になっているか */
function isValidDock(dock: unknown): dock is DockLayout {
  if (!dock || typeof dock !== 'object') return false;
  const panels = DOCK_SLOTS.map((slot) => (dock as Record<string, unknown>)[slot]);
  return new Set(panels).size === DOCK_SLOTS.length && panels.every((p) => Object.values(DEFAULT_DOCK).includes(p as DockPanelId));
}

/**
 * VS Code のように開け閉めできるパネル（ターミナル・ファイル一覧・右の欄）の状態と、
 * Unity のエディタのようにドラッグで入れ替えたパネルの配置
 */
export class LayoutModel {
  terminalOpen: boolean;
  explorerOpen: boolean;
  sideOpen: boolean;
  dock: DockLayout;
  /** ドラッグ中のパネルがあった場所（ドロップ先の候補を目立たせるため） */
  draggingSlot: DockSlotId | null = null;

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
    this.dock = isValidDock(data.dock) ? { ...data.dock } : { ...DEFAULT_DOCK };
    makeAutoObservable(this);
  }

  /** パネルが開いているか（Ctrl+J などで閉じたものは隠す） */
  isPanelOpen(panel: DockPanelId): boolean {
    switch (panel) {
      case 'terminal':
        return this.terminalOpen;
      case 'files':
        return this.explorerOpen;
      case 'graph':
      case 'areas':
        return this.sideOpen;
      default:
        return true;
    }
  }

  isSlotOpen(slot: DockSlotId): boolean {
    return this.isPanelOpen(this.dock[slot]);
  }

  /** 2つの場所のパネルを入れ替える */
  swapPanels(a: DockSlotId, b: DockSlotId): void {
    if (a === b) return;
    this.dock = { ...this.dock, [a]: this.dock[b], [b]: this.dock[a] };
    this.save();
  }

  resetDock(): void {
    this.dock = { ...DEFAULT_DOCK };
    this.save();
  }

  setDragging(slot: DockSlotId | null): void {
    this.draggingSlot = slot;
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
      const data: LayoutData = {
        terminalOpen: this.terminalOpen,
        explorerOpen: this.explorerOpen,
        sideOpen: this.sideOpen,
        dock: this.dock,
      };
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      // 保存できなくても今回は使える
    }
  }
}
