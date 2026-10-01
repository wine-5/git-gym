import { makeAutoObservable } from 'mobx';
import { LANGUAGES, type LanguageId } from '@data/languages';
import { PROJECTS } from '@data/projects';
import { PracticeSession } from './PracticeSession';

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
  currentLessonId = '2-3';
  /** 開いたことのある練習用リポジトリ（画面を行き来してもターミナルの履歴を残す） */
  private readonly sessions = new Map<string, PracticeSession>();

  constructor() {
    makeAutoObservable<AppModel, 'sessions'>(this, { sessions: false });
  }

  /** 今のレッスンの練習用リポジトリ。言語ごとにフォルダを分ける */
  get lessonSession(): PracticeSession | null {
    if (!this.language || !this.project) return null;
    const id = `${this.currentLessonId}-${this.language}`;
    let session = this.sessions.get(id);
    if (!session) {
      session = new PracticeSession({ kind: 'lessons', id }, this.project);
      this.sessions.set(id, session);
    }
    return session;
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

  openLesson(lessonId: string): void {
    this.currentLessonId = lessonId;
    this.screen = 'lesson';
  }
}

export const appModel = new AppModel();
