import type { SetupStep } from '@shared/setup';
import type { RepoQuery } from '@models/RepoQuery';
import type { ProjectTemplate } from './projects';
import { writeProject } from './setupHelpers';

/** 達成判定に渡す情報 */
export interface CheckContext {
  project: ProjectTemplate;
  /** このレッスンで打って成功したコマンド（git status など、状態が変わらない操作の判定用） */
  commands: string[];
  /** 成功したコマンドに pattern に合うものがあるか */
  ran: (pattern: RegExp) => boolean;
  /** 失敗したものも含めて、pattern に合うコマンドを打ったか（push が断られる体験など） */
  tried: (pattern: RegExp) => boolean;
}

export interface LessonCheck {
  /** `code` 記法と {mainFile} / {featureFile} のプレースホルダーが使える */
  label: string;
  /** リポジトリの状態で達成を判定する。一度達成したら戻らない */
  test: (q: RepoQuery, ctx: CheckContext) => Promise<boolean> | boolean;
}

export interface Lesson {
  id: string;
  title: string;
  /** `code` 記法と {mainFile} / {featureFile} のプレースホルダーが使える */
  description: string;
  checks: LessonCheck[];
  hints: string[];
  /** 練習用リポジトリの初期状態。省略すると雛形のファイルだけ置く */
  setup?: (project: ProjectTemplate) => SetupStep[];
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  summary: string;
  commands: string[];
  lessons: Lesson[];
}

export function lessonSetup(lesson: Lesson, project: ProjectTemplate): SetupStep[] {
  return lesson.setup ? lesson.setup(project) : writeProject(project);
}

/** まだ中身を作っていないレッスンの仮置き */
export function stub(id: string, title: string): Lesson {
  return { id, title, description: '（準備中）', checks: [], hints: [] };
}

export function fillPlaceholders(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => vars[key] ?? match);
}
