import { makeAutoObservable, runInAction } from 'mobx';
import { fillPlaceholders, type CheckContext, type Lesson } from '@data/lessons';
import type { ProjectTemplate } from '@data/projects';
import type { PracticeSession } from './PracticeSession';
import { RepoQuery } from './RepoQuery';

/** 1つのレッスンの達成状況。コマンドを打つたびにリポジトリの状態で判定する */
export class LessonRunner {
  /** チェックごとの達成。一度達成したら戻らない（切り替えて戻した、などで消えないように） */
  done: boolean[];
  completed = false;
  /** クリア画面を見終わった（開き直しても毎回は出さない） */
  celebrated = false;
  /** このレッスンで打ったコマンド */
  private commands: string[] = [];

  constructor(
    readonly lesson: Lesson,
    readonly project: ProjectTemplate,
    private readonly session: PracticeSession,
  ) {
    this.done = lesson.checks.map(() => false);
    makeAutoObservable<LessonRunner, 'session' | 'commands'>(this, {
      lesson: false,
      project: false,
      session: false,
      commands: false,
    });
  }

  get doneCount(): number {
    return this.done.filter(Boolean).length;
  }

  get vars(): Record<string, string> {
    return { mainFile: this.project.mainFile, featureFile: this.project.featureFile };
  }

  label(index: number): string {
    return fillPlaceholders(this.lesson.checks[index].label, this.vars);
  }

  recordCommand(line: string): void {
    this.commands.push(line.trim().replace(/s+/g, ' '));
  }

  /** 判定し直して、新しく達成したチェックの番号を返す */
  async evaluate(): Promise<number[]> {
    const query = new RepoQuery(this.session.ref, this.session.repo);
    const commands = [...this.commands];
    const ctx: CheckContext = {
      project: this.project,
      commands,
      ran: (pattern) => commands.some((c) => pattern.test(c)),
    };
    const results = await Promise.all(
      this.lesson.checks.map(async (check, i) => this.done[i] || (await check.test(query, ctx))),
    );

    const newlyDone = results.flatMap((ok, i) => (ok && !this.done[i] ? [i] : []));
    runInAction(() => {
      this.done = results;
      this.completed = results.length > 0 && results.every(Boolean);
    });
    return newlyDone;
  }

  markCelebrated(): void {
    this.celebrated = true;
  }

  /** リセットしたときなど、最初からやり直す */
  restart(): void {
    this.done = this.lesson.checks.map(() => false);
    this.completed = false;
    this.celebrated = false;
    this.commands = [];
  }
}
