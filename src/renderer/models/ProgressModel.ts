import { makeAutoObservable, runInAction } from 'mobx';
import { EMPTY_PROGRESS, type ProgressData } from '@shared/progress';
import { CHAPTERS, type Chapter } from '@data/lessons';

/** クリアしたレッスンと、章のロック状態 */
export class ProgressModel {
  completed = new Set<string>();
  lastLessonId: string | null = null;
  loaded = false;

  constructor() {
    makeAutoObservable(this);
  }

  async load(): Promise<void> {
    const data = window.gitGym ? await window.gitGym.progress.load() : EMPTY_PROGRESS;
    runInAction(() => {
      this.completed = new Set(data.completedLessons);
      this.lastLessonId = data.lastLessonId;
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

  /** 最初の章はいつでも、それ以降は前の章をすべてクリアしたら開く */
  isUnlocked(chapter: Chapter): boolean {
    const index = CHAPTERS.indexOf(chapter);
    if (index <= 0) return true;
    const prev = CHAPTERS[index - 1];
    return this.doneCount(prev) === prev.lessons.length;
  }

  markDone(lessonId: string): void {
    if (this.completed.has(lessonId)) return;
    this.completed.add(lessonId);
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
    };
    await window.gitGym?.progress.save(data);
  }
}
