import type { SetupStep } from '@shared/setup';
import type { RepoQuery } from '@models/RepoQuery';
import type { ProjectTemplate } from './projects';
import { appendAndCommit, initialRepo, writeProject } from './setupHelpers';

export interface LessonCheck {
  /** `code` 記法と {mainFile} / {featureFile} のプレースホルダーが使える */
  label: string;
  /** リポジトリの状態で達成を判定する。一度達成したら戻らない */
  test: (q: RepoQuery, project: ProjectTemplate) => Promise<boolean> | boolean;
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

export function lessonSetup(lesson: Lesson, project: ProjectTemplate): SetupStep[] {
  return lesson.setup ? lesson.setup(project) : writeProject(project);
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  summary: string;
  commands: string[];
  lessons: Lesson[];
}

/** まだ中身を作っていないレッスンの仮置き */
function stub(id: string, title: string): Lesson {
  return { id, title, description: '（準備中）', checks: [], hints: [] };
}

export const CHAPTERS: Chapter[] = [
  {
    id: 'basics',
    number: 1,
    title: 'はじめの一歩',
    summary: '変更を記録する基本の流れ。add と commit の意味を理解しよう。',
    commands: ['init', 'status', 'add', 'commit', 'log', 'diff'],
    lessons: [
      stub('1-1', 'リポジトリを作ろう'),
      stub('1-2', '状態を確認しよう'),
      stub('1-3', 'ステージに乗せよう'),
      stub('1-4', '初めてのコミット'),
      stub('1-5', '履歴を見よう'),
      stub('1-6', '差分を見よう'),
    ],
  },
  {
    id: 'branch',
    number: 2,
    title: 'ブランチ',
    summary: '作業を枝分かれさせて並行開発。コンフリクトの直し方も学ぶ。',
    commands: ['branch', 'switch', 'merge'],
    lessons: [
      stub('2-1', 'ブランチってなに？'),
      stub('2-2', 'ブランチ一覧を見よう'),
      {
        id: '2-3',
        title: 'ブランチを作って新機能を追加しよう',
        description:
          'main ブランチを直接いじるのは危険です。\n' +
          '新しく `feature/jump` ブランチを作って切り替え、そこで `{featureFile}` にジャンプ処理を追加してコミットしましょう。',
        setup: (p) => [
          ...initialRepo(p),
          ...appendAndCommit(p, 'README.md', '\n## 操作方法\n矢印キーで移動', 'README に操作方法を追加'),
        ],
        checks: [
          { label: '`feature/jump` ブランチを作る', test: (q) => q.hasBranch('feature/jump') },
          { label: '`feature/jump` に切り替える', test: (q) => q.currentBranch === 'feature/jump' },
          {
            label: '`{featureFile}` を編集してコミットする',
            test: async (q, p) => {
              const out = await q.run(['log', '--format=', '--name-only', 'main..feature/jump']);
              return out !== null && out.split('\n').includes(p.featureFile);
            },
          },
        ],
        hints: [
          '変更をコミットする前に、まずはステージに乗せる必要があります。どのコマンドを使うか思い出してみましょう。',
          '`git add {featureFile}` でステージに乗せられます。',
          '`git commit -m "ジャンプを追加"` でコミットできます。',
        ],
      },
      stub('2-4', 'ブランチをマージしよう'),
      stub('2-5', 'コンフリクトを解決しよう'),
    ],
  },
  {
    id: 'remote',
    number: 3,
    title: 'リモート',
    summary: 'チームとコードを共有する。push と pull の流れを体験。',
    commands: ['clone', 'push', 'pull', 'fetch'],
    lessons: [stub('3-1', 'clone'), stub('3-2', 'push'), stub('3-3', 'pull'), stub('3-4', 'fetch'), stub('3-5', 'リモートブランチ')],
  },
  {
    id: 'undo',
    number: 4,
    title: '取り消し',
    summary: '失敗しても大丈夫。変更や履歴を元に戻す方法。',
    commands: ['restore', 'reset', 'revert', 'stash'],
    lessons: [stub('4-1', 'restore'), stub('4-2', 'reset'), stub('4-3', 'revert'), stub('4-4', 'stash'), stub('4-5', 'reflog'), stub('4-6', 'まとめ')],
  },
  {
    id: 'advanced',
    number: 5,
    title: '応用',
    summary: '履歴をきれいに整えるテクニック。',
    commands: ['rebase', 'cherry-pick', 'tag'],
    lessons: [stub('5-1', 'rebase'), stub('5-2', 'cherry-pick'), stub('5-3', 'tag'), stub('5-4', 'まとめ')],
  },
  {
    id: 'team',
    number: 6,
    title: 'チーム開発',
    summary: '仲間が先に push していた！ 実践的な総合演習。',
    commands: ['総合演習'],
    lessons: [stub('6-1', '演習 1'), stub('6-2', '演習 2'), stub('6-3', '演習 3')],
  },
];

export function findLesson(lessonId: string): { chapter: Chapter; lesson: Lesson; index: number } | undefined {
  for (const chapter of CHAPTERS) {
    const index = chapter.lessons.findIndex((l) => l.id === lessonId);
    if (index >= 0) return { chapter, lesson: chapter.lessons[index], index };
  }
  return undefined;
}

export function fillPlaceholders(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => vars[key] ?? match);
}

/** 全章を通した次のレッスン（最後なら undefined） */
export function nextLesson(lessonId: string): Lesson | undefined {
  const all = CHAPTERS.flatMap((c) => c.lessons);
  const index = all.findIndex((l) => l.id === lessonId);
  return index >= 0 ? all[index + 1] : undefined;
}
