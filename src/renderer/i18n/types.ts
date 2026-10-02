import type { Locale } from './locale';

/** 画面の文言。キー → 文字列。{name} の形で値を差し込める */
export type Messages = Record<string, string>;

/** 1つの画面（または部品のまとまり）の文言を、言語ごとに持つ。ja が元で、無いキーは ja を使う */
export type UiDictionary = { ja: Messages } & Partial<Record<Exclude<Locale, 'ja'>, Messages>>;

/* ---- レッスン・ステージ・コマンド辞典の翻訳（元の日本語データに上書きする） ---- */

export interface ChapterText {
  title?: string;
  summary?: string;
  /** 章のカードに出すコマンド名以外のラベル（例: 総合演習） */
  commands?: string[];
}

export interface LessonText {
  title?: string;
  /** `code` 記法と {mainFile} / {featureFile} はそのまま残す */
  description?: string;
  /** checks の label を順番どおりに */
  checks?: string[];
  hints?: string[];
}

export interface WorldText {
  title?: string;
}

export interface StageText {
  title?: string;
  /** ミッション文（description と checks[0].label の両方に使う） */
  mission?: string;
  hints?: string[];
}

export interface CommandText {
  summary?: string;
  description?: string;
  /** examples の description を順番どおりに */
  examples?: string[];
  /** options の description を順番どおりに */
  options?: string[];
  caution?: string;
  sourcetree?: string;
}

/** 1つの言語の翻訳。キーは章・レッスン・ワールド・ステージの id、コマンド名、カテゴリ id */
export interface ContentOverlay {
  chapters?: Record<string, ChapterText>;
  lessons?: Record<string, LessonText>;
  worlds?: Record<string, WorldText>;
  stages?: Record<string, StageText>;
  commands?: Record<string, CommandText>;
  categories?: Record<string, string>;
}
