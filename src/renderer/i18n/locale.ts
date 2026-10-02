import { observable, runInAction } from 'mobx';

/** アプリの表示言語 */
export type Locale = 'ja' | 'en' | 'zh' | 'ko';

export const LOCALES: { id: Locale; label: string }[] = [
  { id: 'ja', label: '日本語' },
  { id: 'en', label: 'English' },
  { id: 'zh', label: '简体中文' },
  { id: 'ko', label: '한국어' },
];

export function isLocale(value: unknown): value is Locale {
  return LOCALES.some((l) => l.id === value);
}

/** OS の言語から最初の表示言語を決める（対応していなければ日本語） */
export function detectLocale(): Locale {
  const lang = (typeof navigator !== 'undefined' ? navigator.language : 'ja').slice(0, 2);
  return isLocale(lang) ? lang : 'ja';
}

/** いまの表示言語。observable なので、変えると表示中の画面がすべて切り替わる */
export const localeState = observable({ locale: 'ja' as Locale });

export function setLocale(locale: Locale): void {
  runInAction(() => (localeState.locale = locale));
  if (typeof document !== 'undefined') document.documentElement.lang = locale;
}

export function currentLocale(): Locale {
  return localeState.locale;
}
