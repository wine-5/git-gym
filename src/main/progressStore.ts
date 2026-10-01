import { app } from 'electron';
import { promises as fs } from 'fs';
import * as path from 'path';
import { EMPTY_PROGRESS, type ProgressData } from '../shared/progress';

/** 学習の進み具合を userData/progress.json に保存する */
export class ProgressStore {
  private readonly file = path.join(app.getPath('userData'), 'progress.json');

  async load(): Promise<ProgressData> {
    try {
      const data = JSON.parse(await fs.readFile(this.file, 'utf8')) as Partial<ProgressData>;
      return {
        ...EMPTY_PROGRESS,
        completedLessons: Array.isArray(data.completedLessons) ? data.completedLessons.filter((x) => typeof x === 'string') : [],
        lastLessonId: typeof data.lastLessonId === 'string' ? data.lastLessonId : null,
        learnedCommands: Array.isArray(data.learnedCommands) ? data.learnedCommands.filter((x) => typeof x === 'string') : [],
      };
    } catch {
      return EMPTY_PROGRESS;
    }
  }

  /** 書き込み途中で落ちても壊れないよう、一時ファイルに書いてから置き換える */
  async save(data: ProgressData): Promise<void> {
    const tmp = `${this.file}.tmp`;
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
    await fs.rename(tmp, this.file);
  }
}
