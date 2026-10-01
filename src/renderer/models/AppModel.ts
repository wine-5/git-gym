import { makeAutoObservable } from 'mobx';
import { LANGUAGES, type LanguageId } from '@data/languages';
import { PROJECTS } from '@data/projects';
import { CHAPTERS, findLesson, lessonSetup } from '@data/lessons';
import { LessonRunner } from './LessonRunner';
import { PracticeSession } from './PracticeSession';
import { ProgressModel } from './ProgressModel';

export type Screen = 'language' | 'home' | 'lesson' | 'sandbox' | 'dictionary';

const LANGUAGE_KEY = 'git-gym.language';

function loadLanguage(): LanguageId | null {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    return LANGUAGES.some((l) => l.id === saved) ? (saved as LanguageId) : null;
  } catch {
    return null;
  }
}

export class AppModel {
  language: LanguageId | null = loadLanguage();
  screen: Screen = this.language ? 'home' : 'language';
  currentLessonId = CHAPTERS[0].lessons[0].id;
  readonly progress = new ProgressModel();
  /** コマンド辞典で開いているコマンド */
  dictionaryCommand = 'init';
  /** 開いたことのある練習用リポジトリ（画面を行き来してもターミナルの履歴を残す） */
  private readonly lessons = new Map<string, { session: PracticeSession; runner: LessonRunner }>();

  constructor() {
    makeAutoObservable<AppModel, 'lessons'>(this, { lessons: false, progress: false });
    void this.progress.load().then(() => {
      const last = this.progress.lastLessonId;
      if (last && findLesson(last)) this.setCurrentLesson(last);
    });
  }

  /** 今のレッスンの練習用リポジトリ。言語ごとにフォルダを分ける */
  get lessonSession(): PracticeSession | null {
    return this.currentLesson?.session ?? null;
  }

  /** 今のレッスンの達成状況 */
  get lessonRunner(): LessonRunner | null {
    return this.currentLesson?.runner ?? null;
  }

  private get currentLesson(): { session: PracticeSession; runner: LessonRunner } | null {
    const found = findLesson(this.currentLessonId);
    if (!this.language || !this.project || !found) return null;

    const id = `${this.currentLessonId}-${this.language}`;
    let entry = this.lessons.get(id);
    if (!entry) {
      const session = new PracticeSession({ kind: 'lessons', id }, this.project, lessonSetup(found.lesson, this.project));
      const runner = new LessonRunner(found.lesson, this.project, session);
      const lessonId = this.currentLessonId;
      session.onCommand = async (line, result) => {
        // 失敗したコマンドは ran では数えない（git log がエラーでも達成扱いにならないように）
        runner.recordCommand(line, result.exitCode === 0);
        this.learnFrom(line, result.exitCode);
        for (const i of await runner.evaluate()) session.terminal.push('success', runner.label(i).replace(/`/g, ''));
        if (runner.completed) this.progress.markDone(lessonId);
      };
      entry = { session, runner };
      this.lessons.set(id, entry);
    }
    return entry;
  }

  get project() {
    return this.language ? PROJECTS[this.language] : null;
  }

  selectLanguage(id: LanguageId): void {
    this.language = id;
    try {
      localStorage.setItem(LANGUAGE_KEY, id);
    } catch {
      // 保存できなくても今回のセッションでは使える
    }
    this.screen = 'home';
  }

  navigate(screen: Screen): void {
    this.screen = screen;
  }

  /** 今のレッスンの練習用フォルダを初期状態に戻して、最初からやり直す */
  async resetLesson(): Promise<void> {
    const entry = this.currentLesson;
    if (!entry) return;
    entry.runner.restart();
    await entry.session.reset();
    await entry.runner.evaluate();
  }

  /** 成功した git コマンドをコマンド辞典の「習得済み」にする */
  learnFrom(line: string, exitCode: number): void {
    const [head, sub] = line.trim().split(/\s+/);
    if (exitCode === 0 && head === 'git' && sub && /^[a-z][a-z-]*$/.test(sub)) this.progress.markLearned(sub);
  }

  openDictionary(command?: string): void {
    if (command) this.dictionaryCommand = command;
    this.screen = 'dictionary';
  }

  openLesson(lessonId: string): void {
    this.currentLessonId = lessonId;
    this.progress.setLast(lessonId);
    this.screen = 'lesson';
  }

  private setCurrentLesson(lessonId: string): void {
    this.currentLessonId = lessonId;
  }
}

export const appModel = new AppModel();
