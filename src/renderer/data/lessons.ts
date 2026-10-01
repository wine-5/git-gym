import { advancedChapter } from './chapters/advanced';
import { basicsChapter } from './chapters/basics';
import { branchChapter } from './chapters/branch';
import { remoteChapter } from './chapters/remote';
import { teamChapter } from './chapters/team';
import { undoChapter } from './chapters/undo';
import type { Chapter, Lesson } from './lessonTypes';

export * from './lessonTypes';

export const CHAPTERS: Chapter[] = [basicsChapter, branchChapter, remoteChapter, undoChapter, advancedChapter, teamChapter];

export function findLesson(lessonId: string): { chapter: Chapter; lesson: Lesson; index: number } | undefined {
  for (const chapter of CHAPTERS) {
    const index = chapter.lessons.findIndex((l) => l.id === lessonId);
    if (index >= 0) return { chapter, lesson: chapter.lessons[index], index };
  }
  return undefined;
}

/** 全章を通した次のレッスン（最後なら undefined） */
export function nextLesson(lessonId: string): Lesson | undefined {
  const all = CHAPTERS.flatMap((c) => c.lessons);
  const index = all.findIndex((l) => l.id === lessonId);
  return index >= 0 ? all[index + 1] : undefined;
}
