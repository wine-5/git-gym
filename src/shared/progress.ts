/** 学習の進み具合（userData/progress.json に保存する） */
export interface ProgressData {
  version: 1;
  /** クリアしたレッスンの id */
  completedLessons: string[];
  /** 最後に開いていたレッスン */
  lastLessonId: string | null;
}

export const EMPTY_PROGRESS: ProgressData = {
  version: 1,
  completedLessons: [],
  lastLessonId: null,
};
