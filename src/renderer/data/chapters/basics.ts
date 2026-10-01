import { stub, type Chapter } from '../lessonTypes';

export const basicsChapter: Chapter = {
  id: 'basics',
  number: 1,
  title: 'はじめの一歩',
  summary: '変更を記録する基本の流れ。add と commit の意味を理解しよう。',
  commands: ['init', 'status', 'add', 'commit', 'log', 'diff'],
  lessons: [
    stub('1-1', 'リポジトリを作ろう'),
    stub('1-2', '状態を確認しよう'),
    stub('1-3', 'ステージに乗せよう'),
    stub('1-4', '初めてのコミット'),
    stub('1-5', '履歴を見よう'),
    stub('1-6', '差分を見よう'),
  ],
};
