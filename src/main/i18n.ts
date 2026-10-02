/** メインプロセス側（ターミナルの案内やメニュー）の表示言語。レンダラーの設定から送られてくる */
export type MainLocale = 'ja' | 'en' | 'zh' | 'ko';

let locale: MainLocale = 'ja';

export function setMainLocale(next: string): void {
  if (next === 'ja' || next === 'en' || next === 'zh' || next === 'ko') locale = next;
}

export function mainLocale(): MainLocale {
  return locale;
}

/** 言語ごとの文言から今の言語のものを選ぶ（無ければ日本語） */
export function pick<T>(texts: { ja: T } & Partial<Record<MainLocale, T>>): T {
  return texts[locale] ?? texts.ja;
}
