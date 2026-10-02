import { CHAPTERS } from './lessons';
import { COMMANDS } from './commands';
import { t } from '@i18n/t';
import { currentLocale, type Locale } from '@i18n/locale';

/** 書き出した日時の書式に使う BCP 47 の言語タグ */
const DATE_LOCALES: Record<Locale, string> = { ja: 'ja-JP', en: 'en-US', zh: 'zh-CN', ko: 'ko-KR' };

interface ExportInput {
  completed: Set<string>;
  learned: Set<string>;
  language: string;
}

/** 先生に提出できるよう、学習の記録を CSV（Excel で開ける BOM 付き UTF-8）にする */
export function progressCsv({ completed, learned, language }: ExportInput, now = new Date()): string {
  const rows: string[][] = [
    [t('csv.title')],
    [t('csv.exportedAt'), now.toLocaleString(DATE_LOCALES[currentLocale()])],
    [t('csv.language'), language],
    [t('csv.lessonsCleared'), `${completed.size} / ${CHAPTERS.reduce((n, c) => n + c.lessons.length, 0)}`],
    [t('csv.commandsLearned'), `${COMMANDS.filter((c) => learned.has(c.name)).length} / ${COMMANDS.length}`],
    [],
    [t('csv.chapter'), t('csv.lesson'), t('csv.title2'), t('csv.cleared')],
    ...CHAPTERS.flatMap((chapter) =>
      chapter.lessons.map((l) => [
        `${t('chapterNo', { n: chapter.number })} ${chapter.title}`,
        l.id,
        l.title,
        completed.has(l.id) ? '○' : '',
      ]),
    ),
    [],
    [t('csv.command'), t('csv.learned')],
    ...COMMANDS.map((c) => [`git ${c.name}`, learned.has(c.name) ? '○' : '']),
  ];
  const escape = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return `﻿${rows.map((r) => r.map(escape).join(',')).join('\r\n')}\r\n`;
}

/** ブラウザのダウンロードとして保存させる（Electron では保存ダイアログが出る） */
export function downloadText(filename: string, text: string, type = 'text/csv'): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
