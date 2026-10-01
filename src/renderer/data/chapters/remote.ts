import { stub, type Chapter } from '../lessonTypes';

export const remoteChapter: Chapter = {
  id: 'remote',
  number: 3,
  title: 'リモート',
  summary: 'チームとコードを共有する。push と pull の流れを体験。',
  commands: ['clone', 'push', 'pull', 'fetch'],
  lessons: [stub('3-1', 'clone'), stub('3-2', 'push'), stub('3-3', 'pull'), stub('3-4', 'fetch'), stub('3-5', 'リモートブランチ')],
};
