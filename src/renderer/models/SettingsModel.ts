import { makeAutoObservable } from 'mobx';

const KEY = 'git-gym.settings';

interface SettingsData {
  editorFontSize: number;
  terminalFontSize: number;
  /** 0〜1 */
  bgmVolume: number;
  /** 0〜1 */
  seVolume: number;
  muted: boolean;
  /** SourceTree でいうとどの操作かを解説に出す */
  showSourceTree: boolean;
}

const DEFAULTS: SettingsData = { editorFontSize: 14, terminalFontSize: 13, bgmVolume: 0.35, seVolume: 0.7, muted: false, showSourceTree: false };

export const FONT_SIZE_RANGE = { min: 11, max: 24 };

function load(): SettingsData {
  try {
    return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<SettingsData>) };
  } catch {
    return DEFAULTS;
  }
}

/** 見た目と音の設定（この PC のこのアプリだけに保存） */
export class SettingsModel {
  editorFontSize: number;
  terminalFontSize: number;
  bgmVolume: number;
  seVolume: number;
  muted: boolean;
  showSourceTree: boolean;

  constructor() {
    const data = load();
    this.editorFontSize = data.editorFontSize;
    this.terminalFontSize = data.terminalFontSize;
    this.bgmVolume = data.bgmVolume;
    this.seVolume = data.seVolume;
    this.muted = data.muted;
    this.showSourceTree = data.showSourceTree;
    makeAutoObservable(this);
  }

  setEditorFontSize(size: number): void {
    this.editorFontSize = clamp(size);
    this.save();
  }

  setTerminalFontSize(size: number): void {
    this.terminalFontSize = clamp(size);
    this.save();
  }

  setBgmVolume(volume: number): void {
    this.bgmVolume = clamp01(volume);
    this.save();
  }

  setSeVolume(volume: number): void {
    this.seVolume = clamp01(volume);
    this.save();
  }

  toggleMuted(): void {
    this.muted = !this.muted;
    this.save();
  }

  toggleSourceTree(): void {
    this.showSourceTree = !this.showSourceTree;
    this.save();
  }

  /** パネルの大きさを初期状態に戻す（usePanelSize が保存している値を消す） */
  resetLayout(): void {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('git-gym.panel.'))
        .forEach((k) => localStorage.removeItem(k));
    } catch {
      // 保存できない環境では何もしない
    }
  }

  private save(): void {
    try {
      const data: SettingsData = {
        editorFontSize: this.editorFontSize,
        terminalFontSize: this.terminalFontSize,
        bgmVolume: this.bgmVolume,
        seVolume: this.seVolume,
        muted: this.muted,
        showSourceTree: this.showSourceTree,
      };
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      // 保存できなくても今回は使える
    }
  }
}

function clamp(size: number): number {
  return Math.min(FONT_SIZE_RANGE.max, Math.max(FONT_SIZE_RANGE.min, Math.round(size)));
}

function clamp01(volume: number): number {
  return Math.min(1, Math.max(0, volume));
}
