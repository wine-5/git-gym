import { CHAPTERS } from './lessons';
import { COMMANDS } from './commands';

interface ExportInput {
  completed: Set<string>;
  learned: Set<string>;
  language: string;
}

/** 先生に提出できるよう、学習の記録を CSV（Excel で開ける BOM 付き UTF-8）にする */
export function progressCsv({ completed, learned, language }: ExportInput, now = new Date()): string {
  const rows: string[][] = [
    ['Git Gym 学習記録'],
    ['書き出した日時', now.toLocaleString('ja-JP')],
    ['練習した言語', language],
    ['クリアしたレッスン', `${completed.size} / ${CHAPTERS.reduce((n, c) => n + c.lessons.length, 0)}`],
    ['習得したコマンド', `${COMMANDS.filter((c) => learned.has(c.name)).length} / ${COMMANDS.length}`],
    [],
    ['章', 'レッスン', 'タイトル', 'クリア'],
    ...CHAPTERS.flatMap((chapter) =>
      chapter.lessons.map((l) => [`第${chapter.number}章 ${chapter.title}`, l.id, l.title, completed.has(l.id) ? '○' : '']),
    ),
    [],
    ['コマンド', '習得'],
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
