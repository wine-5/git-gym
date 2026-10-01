import { makeAutoObservable } from 'mobx';

const KEY = 'git-gym.settings';

interface SettingsData {
  editorFontSize: number;
  terminalFontSize: number;
}

const DEFAULTS: SettingsData = { editorFontSize: 14, terminalFontSize: 13 };

export const FONT_SIZE_RANGE = { min: 11, max: 24 };

function load(): SettingsData {
  try {
    return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<SettingsData>) };
  } catch {
    return DEFAULTS;
  }
}

/** 見た目の設定（この PC のこのアプリだけに保存） */
export class SettingsModel {
  editorFontSize: number;
  terminalFontSize: number;

  constructor() {
    const data = load();
    this.editorFontSize = data.editorFontSize;
    this.terminalFontSize = data.terminalFontSize;
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
      const data: SettingsData = { editorFontSize: this.editorFontSize, terminalFontSize: this.terminalFontSize };
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      // 保存できなくても今回は使える
    }
  }
}

function clamp(size: number): number {
  return Math.min(FONT_SIZE_RANGE.max, Math.max(FONT_SIZE_RANGE.min, Math.round(size)));
}
