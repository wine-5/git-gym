import { makeAutoObservable, runInAction } from 'mobx';
import { EMPTY_PROGRESS, type ProgressData } from '@shared/progress';
import { CHAPTERS, type Chapter } from '@data/lessons';

/** クリアしたレッスン・習得したコマンド・ステージの星 */
export class ProgressModel {
  completed = new Set<string>();
  lastLessonId: string | null = null;
  learned = new Set<string>();
  stageStars = new Map<string, number>();
  loaded = false;

  constructor() {
    makeAutoObservable(this);
  }

  async load(): Promise<void> {
    const data = window.gitGym ? await window.gitGym.progress.load() : EMPTY_PROGRESS;
    runInAction(() => {
      this.completed = new Set(data.completedLessons);
      this.lastLessonId = data.lastLessonId;
      this.learned = new Set(data.learnedCommands);
      this.stageStars = new Map(Object.entries(data.stageStars));
      this.loaded = true;
    });
  }

  isDone(lessonId: string): boolean {
    return this.completed.has(lessonId);
  }

  doneCount(chapter: Chapter): number {
    return chapter.lessons.filter((l) => this.completed.has(l.id)).length;
  }

  get totalLessons(): number {
    return CHAPTERS.reduce((sum, c) => sum + c.lessons.length, 0);
  }

  get percent(): number {
    return Math.round((this.completed.size / this.totalLessons) * 100);
  }

  markDone(lessonId: string): void {
    if (this.completed.has(lessonId)) return;
    this.completed.add(lessonId);
    void this.save();
  }

  /** 成功した git コマンドを「習得済み」にする */
  markLearned(subcommand: string): void {
    if (this.learned.has(subcommand)) return;
    this.learned.add(subcommand);
    void this.save();
  }

  /** ステージの星を記録する（前より良いときだけ上書き） */
  setStars(stageId: string, stars: number): void {
    if ((this.stageStars.get(stageId) ?? 0) >= stars) return;
    this.stageStars.set(stageId, stars);
    void this.save();
  }

  /** 進み具合をすべて消して最初からにする */
  resetAll(): void {
    this.completed = new Set();
    this.learned = new Set();
    this.stageStars = new Map();
    this.lastLessonId = null;
    void this.save();
  }

  setLast(lessonId: string): void {
    this.lastLessonId = lessonId;
    void this.save();
  }

  private async save(): Promise<void> {
    const data: ProgressData = {
      version: 1,
      completedLessons: [...this.completed],
      lastLessonId: this.lastLessonId,
      learnedCommands: [...this.learned],
      stageStars: Object.fromEntries(this.stageStars),
    };
    try {
      await window.gitGym?.progress.save(data);
    } catch (e) {
      // 保存に失敗しても学習は続けられるので、画面は止めない（次の保存で追いつく）
      console.warn('進み具合を保存できませんでした', e);
    }
  }
}
