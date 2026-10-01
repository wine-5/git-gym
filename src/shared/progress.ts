/** 学習の進み具合（userData/progress.json に保存する） */
export interface ProgressData {
  version: 1;
  /** クリアしたレッスンの id */
  completedLessons: string[];
  /** 最後に開いていたレッスン */
  lastLessonId: string | null;
  /** 成功させたことのある git のサブコマンド（コマンド辞典の「習得済み」表示用） */
  learnedCommands: string[];
  /** 練習モードのステージごとの星（1〜3） */
  stageStars: Record<string, number>;
}

export const EMPTY_PROGRESS: ProgressData = {
  version: 1,
  completedLessons: [],
  lastLessonId: null,
  learnedCommands: [],
  stageStars: {},
};
