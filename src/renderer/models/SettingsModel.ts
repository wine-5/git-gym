import { makeAutoObservable } from 'mobx';
import { detectLocale, isLocale, setLocale as applyLocale, type Locale } from '@i18n/locale';

const KEY = 'git-gym.settings';

export type Theme = 'dark' | 'light';

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
  /** レッスンのヒントを表示する（問題をまたいで引き継ぐ） */
  showHints: boolean;
  theme: Theme;
  /** アプリの表示言語（保存が無ければ OS の言語） */
  locale: Locale;
}

const DEFAULTS: SettingsData = {
  editorFontSize: 14,
  terminalFontSize: 13,
  bgmVolume: 0.35,
  seVolume: 0.7,
  muted: false,
  showSourceTree: false,
  showHints: false,
  theme: 'dark',
  locale: 'ja',
};

export const FONT_SIZE_RANGE = { min: 11, max: 24 };

function load(): SettingsData {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<SettingsData>;
    return { ...DEFAULTS, ...saved, locale: isLocale(saved.locale) ? saved.locale : detectLocale() };
  } catch {
    return { ...DEFAULTS, locale: detectLocale() };
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
  showHints: boolean;
  theme: Theme;
  locale: Locale;

  constructor() {
    const data = load();
    this.editorFontSize = data.editorFontSize;
    this.terminalFontSize = data.terminalFontSize;
    this.bgmVolume = data.bgmVolume;
    this.seVolume = data.seVolume;
    this.muted = data.muted;
    this.showSourceTree = data.showSourceTree;
    this.showHints = data.showHints;
    this.theme = data.theme;
    applyTheme(this.theme);
    this.locale = data.locale;
    shareLocale(this.locale);
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

  setLocale(locale: Locale): void {
    this.locale = locale;
    shareLocale(locale);
    this.save();
  }

  setTheme(theme: Theme): void {
    this.theme = theme;
    applyTheme(theme);
    this.save();
  }

  toggleHints(): void {
    this.showHints = !this.showHints;
    this.save();
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
        showHints: this.showHints,
        theme: this.theme,
        locale: this.locale,
      };
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      // 保存できなくても今回は使える
    }
  }
}

/** 画面の文言と、メインプロセス（ターミナルの案内・メニュー）の言語を切り替える */
function shareLocale(locale: Locale): void {
  applyLocale(locale);
  void window.gitGym?.app.setLocale(locale);
}

/** global.css の :root[data-theme='light'] を有効にする */
function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
}

function clamp(size: number): number {
  return Math.min(FONT_SIZE_RANGE.max, Math.max(FONT_SIZE_RANGE.min, Math.round(size)));
}

function clamp01(volume: number): number {
  return Math.min(1, Math.max(0, volume));
}
