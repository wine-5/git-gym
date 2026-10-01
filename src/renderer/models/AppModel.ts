import { makeAutoObservable } from 'mobx';
import { LANGUAGES, type LanguageId } from '@data/languages';
import { PROJECTS } from '@data/projects';
import { WorkspaceModel } from './WorkspaceModel';

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
  readonly workspace = new WorkspaceModel();

  constructor() {
    makeAutoObservable(this);
    if (this.language) this.workspace.load(PROJECTS[this.language]);
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
    this.workspace.load(PROJECTS[id]);
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
