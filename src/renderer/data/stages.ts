import type { SetupStep } from '@shared/setup';
import type { Lesson, LessonCheck } from './lessonTypes';
import type { ProjectTemplate } from './projects';
import { comment, commitAll, git, initialRepo, write, writeProject } from './setupHelpers';

/**
 * 練習モード：1ステージ＝1つの小さなミッション。
 * レッスンの仕組み（初期化手順と達成判定）をそのまま使い、チェックを1つだけ持たせる。
 */
export interface Stage extends Lesson {
  world: string;
}

export interface World {
  id: string;
  number: number;
  title: string;
  color: string;
  stages: Stage[];
}

const fileOf = (p: ProjectTemplate, path: string) => p.files.find((f) => f.path === path)?.content ?? '';
const withLine = (p: ProjectTemplate, text: string) => `${fileOf(p, p.featureFile)}${comment(p, text)}\n`;
const initOnly = (p: ProjectTemplate): SetupStep[] => [...writeProject(p), git('init', '-b', 'main')];
const edited = (p: ProjectTemplate): SetupStep[] => [...initialRepo(p), write(p.featureFile, withLine(p, '変更'))];
const withRemote = (p: ProjectTemplate): SetupStep[] => [...initialRepo(p), { kind: 'remote' }, git('push', '-u', 'origin', 'main')];
const teammate = (p: ProjectTemplate): SetupStep => ({
  kind: 'teammate',
  message: 'README を更新',
  files: [{ path: 'README.md', content: `${fileOf(p, 'README.md')}\nチームメイトの追記\n` }],
});

/** ステージを短く書くための関数 */
function stage(
  world: string,
  id: string,
  title: string,
  mission: string,
  check: LessonCheck['test'],
  hints: [string, string],
  setup?: (p: ProjectTemplate) => SetupStep[],
): Stage {
  return { world, id, title, description: mission, checks: [{ label: mission, test: check }], hints, setup };
}

const W1 = 'basics';
const W2 = 'branch';
const W3 = 'remote';
const W4 = 'undo';

export const WORLDS: World[] = [
  {
    id: W1,
    number: 1,
    title: '記録のきほん',
    color: '#4cc38a',
    stages: [
      stage(W1, 's1-1', 'はじめる', 'このフォルダを Git のリポジトリにしよう', (q) => q.isRepo, ['リポジトリを作るコマンドです', '`git init`']),
      stage(W1, 's1-2', 'ようすを見る', '今の状態を確認しよう', (_q, c) => c.ran(/^git status/), ['迷ったらまずこれ！', '`git status`'], initOnly),
      stage(
        W1,
        's1-3',
        'ひとつ乗せる',
        '`{featureFile}` だけをステージに乗せよう',
        (q, c) => q.isStaged(c.project.featureFile),
        ['ステージに乗せるのは add です', '`git add {featureFile}`'],
        initOnly,
      ),
      stage(
        W1,
        's1-4',
        'まとめて乗せる',
        '残りのファイルもまとめてステージに乗せよう',
        (q) => q.snapshot.working.length === 0 && q.snapshot.staged.length > 1,
        ['「今のフォルダ全部」は . で表せます', '`git add .`'],
        (p) => [...initOnly(p), git('add', p.featureFile)],
      ),
      stage(
        W1,
        's1-5',
        'きろくする',
        'メッセージを付けてコミットしよう',
        (q) => q.commitCount >= 1,
        ['-m のあとにメッセージを書きます', '`git commit -m "最初のコミット"`'],
        (p) => [...initOnly(p), git('add', '-A')],
      ),
      stage(W1, 's1-6', 'ふりかえる', '履歴を1行ずつ表示しよう', (_q, c) => c.ran(/^git log .*--oneline/), ['log にオプションを付けます', '`git log --oneline`'], initialRepo),
      stage(W1, 's1-7', 'くらべる', '何を変更したか見てみよう', (_q, c) => c.ran(/^git diff/), ['差分を見るコマンドです', '`git diff`'], edited),
      stage(
        W1,
        's1-8',
        'いっきに記録',
        'add と commit を1回でやってしまおう',
        async (q) => q.isClean && (await q.countCommits('HEAD')) >= 2,
        ['commit に -a を付けると、変更したファイルを自動で add します', '`git commit -am "変更を記録"`'],
        edited,
      ),
    ],
  },
  {
    id: W2,
    number: 2,
    title: 'ブランチの森',
    color: '#f05033',
    stages: [
      stage(W2, 's2-1', '枝を数える', 'ブランチの一覧を見よう', (_q, c) => c.ran(/^git branch$/), ['ブランチを扱うコマンドです', '`git branch`'], initialRepo),
      stage(
        W2,
        's2-2',
        '枝を作る',
        '`feature/a` ブランチを作ろう',
        (q) => q.hasBranch('feature/a'),
        ['branch のあとに名前を付けます', '`git branch feature/a`'],
        initialRepo,
      ),
      stage(
        W2,
        's2-3',
        '枝にのる',
        '`feature/a` ブランチに切り替えよう',
        (q) => q.currentBranch === 'feature/a',
        ['切り替えは switch です', '`git switch feature/a`'],
        (p) => [...initialRepo(p), git('branch', 'feature/a')],
      ),
      stage(
        W2,
        's2-4',
        '作ってのる',
        '`feature/b` を作って、そのまま切り替えよう',
        (q) => q.currentBranch === 'feature/b',
        ['switch に -c を付けると作成もできます', '`git switch -c feature/b`'],
        initialRepo,
      ),
      stage(
        W2,
        's2-5',
        '枝を合わせる',
        '`feature/a` を main にマージしよう',
        async (q) => (await q.countCommits('main')) >= 2 && q.isMergedInto('feature/a', 'main'),
        ['今は main にいます。取り込みたいブランチを指定します', '`git merge feature/a`'],
        (p) => [
          ...initialRepo(p),
          git('switch', '-c', 'feature/a'),
          write(p.featureFile, withLine(p, '新機能')),
          ...commitAll('新機能を追加'),
          git('switch', 'main'),
        ],
      ),
      stage(
        W2,
        's2-6',
        '枝をかたづける',
        'マージ済みの `feature/a` を消そう',
        async (q) => !(await q.hasBranch('feature/a')),
        ['branch に -d を付けると消せます', '`git branch -d feature/a`'],
        (p) => [
          ...initialRepo(p),
          git('switch', '-c', 'feature/a'),
          write(p.featureFile, withLine(p, '新機能')),
          ...commitAll('新機能を追加'),
          git('switch', 'main'),
          git('merge', 'feature/a'),
        ],
      ),
    ],
  },
  {
    id: W3,
    number: 3,
    title: 'リモートの海',
    color: '#b48cff',
    stages: [
      stage(W3, 's3-1', '相手を知る', 'つながっているリモートを確かめよう', (_q, c) => c.ran(/^git remote -v/), ['remote に -v を付けると URL も出ます', '`git remote -v`'], withRemote),
      stage(
        W3,
        's3-2',
        '送る',
        '手元のコミットをリモートに送ろう',
        async (q) => (await q.countCommits('origin/main')) >= 2,
        ['送るのは push です', '`git push`'],
        (p) => [...withRemote(p), write(p.featureFile, withLine(p, '送る変更')), ...commitAll('送る変更')],
      ),
      stage(
        W3,
        's3-3',
        '受け取る',
        '仲間の変更を取り込もう',
        async (q) => (await q.fileAt('HEAD', 'README.md'))?.includes('チームメイト') ?? false,
        ['取ってきて取り込むのは pull です', '`git pull`'],
        (p) => [...withRemote(p), teammate(p)],
      ),
      stage(
        W3,
        's3-4',
        'のぞく',
        '取り込まずに、リモートの情報だけ取ってこよう',
        async (q) => (await q.countCommits('origin/main')) >= 2,
        ['取ってくるだけなのは fetch です', '`git fetch`'],
        (p) => [...withRemote(p), teammate(p)],
      ),
      stage(
        W3,
        's3-5',
        '枝を送る',
        '`feature/c` ブランチをリモートに送ろう',
        async (q) => (await q.remoteBranches()).includes('origin/feature/c'),
        ['初めて送るブランチは -u origin を付けます', '`git push -u origin feature/c`'],
        (p) => [...withRemote(p), git('switch', '-c', 'feature/c')],
      ),
    ],
  },
  {
    id: W4,
    number: 4,
    title: 'やり直しの塔',
    color: '#e8c46a',
    stages: [
      stage(
        W4,
        's4-1',
        'もとどおり',
        '`{featureFile}` の変更を取り消そう',
        (q, c) => !q.isModified(c.project.featureFile),
        ['ファイルを元に戻すのは restore です', '`git restore {featureFile}`'],
        edited,
      ),
      stage(
        W4,
        's4-2',
        'おろす',
        '`{featureFile}` をステージから下ろそう（変更は残す）',
        (q, c) => !q.isStaged(c.project.featureFile) && q.isModified(c.project.featureFile),
        ['restore に --staged を付けます', '`git restore --staged {featureFile}`'],
        (p) => [...edited(p), git('add', p.featureFile)],
      ),
      stage(
        W4,
        's4-3',
        'いいなおす',
        '直前のコミットのメッセージ「typo」を直そう',
        async (q) => (await q.countCommits('HEAD')) === 2 && (await q.message()) !== 'typo',
        ['直前のコミットは --amend でやり直せます', '`git commit --amend -m "ジャンプを追加"`'],
        (p) => [...edited(p), ...commitAll('typo')],
      ),
      stage(
        W4,
        's4-4',
        'うちけす',
        '最新のコミットを打ち消すコミットを作ろう',
        async (q) => (await q.message())?.startsWith('Revert') ?? false,
        ['履歴を残したまま取り消すのは revert です', '`git revert HEAD`'],
        (p) => [...edited(p), ...commitAll('バグ入りのコミット')],
      ),
      stage(
        W4,
        's4-5',
        'しまう',
        '作業中の変更を一時的にしまおう',
        async (q) => (await q.stashCount()) >= 1,
        ['一時退避は stash です', '`git stash`'],
        edited,
      ),
      stage(
        W4,
        's4-6',
        'とりだす',
        'しまってある変更を取り出そう',
        async (q, c) => (await q.stashCount()) === 0 && q.isModified(c.project.featureFile),
        ['stash に pop を付けます', '`git stash pop`'],
        (p) => [...edited(p), git('stash')],
      ),
    ],
  },
];

export const ALL_STAGES: Stage[] = WORLDS.flatMap((w) => w.stages);

export function findStage(id: string): { world: World; stage: Stage; index: number } | undefined {
  for (const world of WORLDS) {
    const index = world.stages.findIndex((s) => s.id === id);
    if (index >= 0) return { world, stage: world.stages[index], index };
  }
  return undefined;
}

export function nextStage(id: string): Stage | undefined {
  const index = ALL_STAGES.findIndex((s) => s.id === id);
  return index >= 0 ? ALL_STAGES[index + 1] : undefined;
}

/** 星の数：失敗なしで 3、2回までなら 2、それ以上は 1。答えのコマンドを見たら最大 2 */
export function starsFor(failed: number, sawAnswer: boolean): number {
  const base = failed === 0 ? 3 : failed <= 2 ? 2 : 1;
  return sawAnswer ? Math.min(base, 2) : base;
}
