import { stub, type Chapter } from '../lessonTypes';

export const teamChapter: Chapter = {
  id: 'team',
  number: 6,
  title: 'チーム開発',
  summary: '仲間が先に push していた！ 実践的な総合演習。',
  commands: ['総合演習'],
  lessons: [stub('6-1', '演習 1'), stub('6-2', '演習 2'), stub('6-3', '演習 3')],
};
