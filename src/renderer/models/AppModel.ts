import { autorun, makeAutoObservable } from 'mobx';
import { LANGUAGES, type LanguageId } from '@data/languages';
import { PROJECTS } from '@data/projects';
import { initialRepo } from '@data/setupHelpers';
import { CHAPTERS, findLesson, lessonSetup, type Lesson } from '@data/lessons';
import { ALL_STAGES, findStage } from '@data/stages';
import { LessonRunner } from './LessonRunner';
import { PracticeSession } from './PracticeSession';
import { ProgressModel } from './ProgressModel';
import { SettingsModel } from './SettingsModel';
import { SoundManager } from './SoundManager';

export type Screen = 'language' | 'home' | 'lesson' | 'stages' | 'stage' | 'sandbox' | 'dictionary' | 'settings';

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
  readonly settings = new SettingsModel();
  readonly sound = new SoundManager(this.settings);
  /** 練習モードで遊んでいるステージ */
  currentStageId = ALL_STAGES[0].id;
  /** コマンド辞典で開いているコマンド */
  dictionaryCommand = 'init';
  /** 開いたことのある練習用リポジトリ（画面を行き来してもターミナルの履歴を残す） */
  private readonly lessons = new Map<string, { session: PracticeSession; runner: LessonRunner }>();
  private readonly sandboxes = new Map<string, PracticeSession>();

  constructor() {
    makeAutoObservable<AppModel, 'lessons' | 'sandboxes'>(this, { lessons: false, sandboxes: false, progress: false, settings: false, sound: false });
    // 練習中は控えめな BGM、それ以外はホームの BGM
    autorun(() => {
      const practicing = ['lesson', 'stage', 'sandbox'].includes(this.screen);
      this.sound.setBgm(this.screen === 'language' ? null : practicing ? 'practice' : 'home');
    });
    void this.progress.load().then(() => {
      const last = this.progress.lastLessonId;
      if (last && findLesson(last)) this.setCurrentLesson(last);
    });
  }

  /** 今のレッスンの練習用リポジトリ。言語ごとにフォルダを分ける */
  get lessonSession(): PracticeSession | null {
    return this.currentLesson?.session ?? null;
  }

  /** フリー練習の練習用リポジトリ（言語ごと）。リモートも用意して push / pull も試せるようにする */
  get sandboxSession(): PracticeSession | null {
    if (!this.language || !this.project) return null;
    const id = `free-${this.language}`;
    let session = this.sandboxes.get(id);
    if (!session) {
      const project = this.project;
      session = new PracticeSession({ kind: 'sandbox', id }, project, [
        ...initialRepo(project),
        { kind: 'remote' },
        { kind: 'git', args: ['push', '-u', 'origin', 'main'] },
      ]);
      session.onCommand = async (line, result) => {
        this.learnFrom(line, result.exitCode);
        if (result.exitCode !== 0) this.sound.play('error');
      };
      this.sandboxes.set(id, session);
    }
    return session;
  }

  /** 今のステージの練習用リポジトリと達成判定（星は画面側で付ける） */
  get stageEntry(): { session: PracticeSession; runner: LessonRunner } | null {
    const found = findStage(this.currentStageId);
    return found ? this.practiceEntry('stages', found.stage, () => undefined) : null;
  }

  /** 今のレッスンの達成状況 */
  get lessonRunner(): LessonRunner | null {
    return this.currentLesson?.runner ?? null;
  }

  private get currentLesson(): { session: PracticeSession; runner: LessonRunner } | null {
    const found = findLesson(this.currentLessonId);
    if (!found) return null;
    const lessonId = this.currentLessonId;
    return this.practiceEntry('lessons', found.lesson, () => {
      if (!this.progress.isDone(lessonId)) this.sound.play('mission');
      this.progress.markDone(lessonId);
    });
  }

  /**
   * レッスン（やステージ）用の練習用リポジトリと達成判定を作る。言語ごとにフォルダを分け、作ったものは使い回す。
   * コマンドを打つたびに判定し、達成したら onCompleted を呼ぶ。
   */
  private practiceEntry(
    kind: 'lessons' | 'stages',
    lesson: Lesson,
    onCompleted: () => void,
  ): { session: PracticeSession; runner: LessonRunner } | null {
    if (!this.language || !this.project) return null;

    const id = `${lesson.id}-${this.language}`;
    const key = `${kind}/${id}`;
    let entry = this.lessons.get(key);
    if (!entry) {
      const session = new PracticeSession({ kind, id }, this.project, lessonSetup(lesson, this.project));
      const runner = new LessonRunner(lesson, this.project, session);
      session.onCommand = async (line, result) => {
        // 失敗したコマンドは ran では数えない（git log がエラーでも達成扱いにならないように）
        runner.recordCommand(line, result.exitCode === 0);
        this.learnFrom(line, result.exitCode);
        if (result.exitCode !== 0) this.sound.play('error');
        const newlyDone = await runner.evaluate();
        for (const i of newlyDone) session.terminal.push('success', runner.label(i).replace(/`/g, ''));
        if (newlyDone.length > 0 && !runner.completed) this.sound.play('success');
        if (runner.completed) onCompleted();
      };
      entry = { session, runner };
      this.lessons.set(key, entry);
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

  openStage(stageId: string): void {
    this.currentStageId = stageId;
    this.screen = 'stage';
  }

  /** 今のステージを初期状態からやり直す */
  async resetStage(): Promise<void> {
    const entry = this.stageEntry;
    if (!entry) return;
    entry.runner.restart();
    await entry.session.reset();
    await entry.runner.evaluate();
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
