import { stub, type Chapter } from '../lessonTypes';

export const advancedChapter: Chapter = {
  id: 'advanced',
  number: 5,
  title: '応用',
  summary: '履歴をきれいに整えるテクニック。',
  commands: ['rebase', 'cherry-pick', 'tag'],
  lessons: [stub('5-1', 'rebase'), stub('5-2', 'cherry-pick'), stub('5-3', 'tag'), stub('5-4', 'まとめ')],
};
