import { currentLocale, type Locale } from './locale';
import type { Messages, UiDictionary } from './types';
import common from './ui/common';
import screens from './ui/screens';
import practice from './ui/practice';

const DICTIONARIES: UiDictionary[] = [common, screens, practice];

/** 言語ごとに全部の辞書をまとめたもの */
const MERGED: Record<Locale, Messages> = { ja: {}, en: {}, zh: {}, ko: {} };
for (const dict of DICTIONARIES) {
  for (const locale of Object.keys(MERGED) as Locale[]) Object.assign(MERGED[locale], dict[locale] ?? {});
}

/**
 * 画面の文言を今の表示言語で返す。訳が無ければ日本語、それも無ければキーをそのまま返す。
 * `{name}` は vars の値に置き換える。observer の中で呼べば、言語を変えたときに描き直される
 */
export function t(key: string, vars?: Record<string, string | number>): string {
  const locale = currentLocale();
  const text = MERGED[locale][key] ?? MERGED.ja[key] ?? key;
  return vars ? text.replace(/\{(\w+)\}/g, (m, name: string) => (name in vars ? String(vars[name]) : m)) : text;
}

/** テストやスクリプト用：日本語にあるのに訳が無いキー */
export function missingKeys(locale: Locale): string[] {
  return Object.keys(MERGED.ja).filter((k) => !(k in MERGED[locale]));
}
