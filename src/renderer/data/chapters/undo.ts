import { stub, type Chapter } from '../lessonTypes';

export const undoChapter: Chapter = {
  id: 'undo',
  number: 4,
  title: '取り消し',
  summary: '失敗しても大丈夫。変更や履歴を元に戻す方法。',
  commands: ['restore', 'reset', 'revert', 'stash'],
  lessons: [stub('4-1', 'restore'), stub('4-2', 'reset'), stub('4-3', 'revert'), stub('4-4', 'stash'), stub('4-5', 'reflog'), stub('4-6', 'まとめ')],
};
