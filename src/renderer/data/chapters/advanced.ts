import type { SetupStep } from '@shared/setup';
import { includesRepoText, isRepoText } from '@i18n/repoText';
import type { Chapter } from '../lessonTypes';
import type { ProjectTemplate } from '../projects';
import { comment, commitAll, git, initialRepo, write } from '../setupHelpers';

const fileOf = (p: ProjectTemplate, path: string) => p.files.find((f) => f.path === path)?.content ?? '';
const withLine = (p: ProjectTemplate, text: string) => `${fileOf(p, p.featureFile)}${comment(p, text)}\n`;
const readmeWith = (p: ProjectTemplate, text: string) => `${fileOf(p, 'README.md')}\n${text}\n`;

/** feature/menu で作業している間に、main が先に進んだ状態（今いるのは feature/menu） */
const divergedMenu = (p: ProjectTemplate): SetupStep[] => [
  ...initialRepo(p),
  git('switch', '-c', 'feature/menu'),
  write(p.featureFile, withLine(p, 'メニュー画面')),
  ...commitAll('メニュー画面を追加'),
  git('switch', 'main'),
  write('README.md', readmeWith(p, '## 更新履歴\n- タイトル画面を改善')),
  ...commitAll('README に更新履歴を追加'),
  git('switch', 'feature/menu'),
];

export const advancedChapter: Chapter = {
  id: 'advanced',
  number: 5,
  title: '応用',
  summary: '履歴をきれいに整えるテクニック。',
  commands: ['rebase', 'cherry-pick', 'tag'],
  lessons: [
    {
      id: '5-1',
      title: '土台を付け替えよう（rebase）',
      description:
        '`feature/menu` で作業している間に、`main` が先に進みました。\n' +
        '`git rebase main` で、自分のコミットを最新の `main` の上に付け替えて、履歴を一直線にしましょう。グラフの形の変化に注目！',
      setup: divergedMenu,
      checks: [
        { label: '`git log --oneline --graph --all` で枝分かれを確かめる', test: (_q, c) => c.ran(/^git log .*--graph/) },
        {
          label: '`feature/menu` を最新の `main` の上に付け替える',
          test: async (q) => (await q.isMergedInto('main', 'feature/menu')) && (await q.parentCount('feature/menu')) === 1,
        },
      ],
      hints: [
        '今いるのは `feature/menu` です。そのまま `git rebase main` を打ちましょう。',
        'rebase は「自分のコミットを一度外して、相手の先端に付け直す」操作です。マージコミットができないので履歴がまっすぐになります。',
        '注意：push 済みのブランチを rebase すると、チームの履歴とずれてしまいます。自分だけのブランチで使いましょう。',
      ],
    },
    {
      id: '5-2',
      title: '1つだけ持ってこよう（cherry-pick）',
      description:
        '`feature/experiment` ブランチには、実験中のコミットと「HP の計算のバグを修正」したコミットがあります。\n' +
        'バグ修正だけを先に `main` に取り込みたい！ `git cherry-pick` で、そのコミットだけを持ってきましょう。',
      setup: (p) => [
        ...initialRepo(p),
        git('switch', '-c', 'feature/experiment'),
        write(p.featureFile, withLine(p, 'HP がマイナスにならないよう修正')),
        ...commitAll('HP の計算のバグを修正'),
        write('README.md', readmeWith(p, '## 実験中\n空を飛べるようにしたい')),
        ...commitAll('実験：空を飛ぶ機能のメモ'),
        git('switch', 'main'),
      ],
      checks: [
        {
          label: '`git log --oneline feature/experiment` で取り込みたいコミットを探す',
          test: (_q, c) => c.ran(/^git log .*feature\/experiment/),
        },
        {
          label: 'バグ修正のコミットだけを `main` に取り込む',
          test: async (q, c) =>
            q.currentBranch === 'main' &&
            isRepoText(await q.message(), 'HP の計算のバグを修正') &&
            (await q.fileAt('HEAD', 'README.md').then((readme) => readme !== null && !includesRepoText(readme, '実験中'))) &&
            includesRepoText(await q.fileAt('HEAD', c.project.featureFile), 'マイナス'),
        },
      ],
      hints: [
        '`git log --oneline feature/experiment` で、各コミットの左にある短い ID（ハッシュ）が見られます。',
        '`git cherry-pick <ハッシュ>` で、そのコミットの変更だけを今のブランチに持ってこられます。',
        '「HP の計算のバグを修正」のハッシュを選びましょう。実験のコミットは持ってこないように！',
      ],
    },
    {
      id: '5-3',
      title: '目印を付けよう（tag）',
      description:
        'ゲームのバージョン 1.0 が完成しました！\n' +
        '今のコミットに `v1.0` というタグ（しおり）を付けて、あとからいつでもこの状態を見られるようにしましょう。',
      setup: (p) => [
        ...initialRepo(p),
        write(p.featureFile, withLine(p, 'バージョン 1.0 の調整')),
        ...commitAll('リリースに向けて調整'),
      ],
      checks: [
        { label: '`git tag v1.0` でタグを付ける', test: async (q) => (await q.tags()).includes('v1.0') },
        { label: '`git tag` でタグの一覧を見る', test: (_q, c) => c.ran(/^git tag$|^git tag (-l|--list)/) },
        { label: '`git show v1.0` でタグの付いたコミットを見る', test: (_q, c) => c.ran(/^git show v1\.0/) },
      ],
      hints: [
        '`git tag v1.0` で、今いるコミットに目印が付きます。グラフにもタグが表示されます。',
        '`git tag` だけを打つと一覧が出ます。',
        'タグ名はコミットのハッシュの代わりに使えます。`git show v1.0` で中身を見てみましょう。',
      ],
    },
    {
      id: '5-4',
      title: 'まとめ：きれいな履歴でリリース',
      description:
        '`feature/menu` の作業が終わりました。でも `main` が先に進んでいます。\n' +
        'rebase で履歴を一直線にしてから `main` に取り込み（マージコミットを作らない早送りマージになります）、`v2.0` のタグを付けましょう。',
      setup: divergedMenu,
      checks: [
        {
          label: '`feature/menu` を最新の `main` の上に付け替える',
          test: async (q) => (await q.isMergedInto('main', 'feature/menu')) && (await q.parentCount('feature/menu')) === 1,
        },
        {
          label: '`main` に `feature/menu` を取り込む（マージコミットなし）',
          test: async (q) =>
            (await q.countCommits('main')) >= 3 &&
            (await q.isMergedInto('feature/menu', 'main')) &&
            (await q.parentCount('main')) === 1,
        },
        { label: '`v2.0` のタグを付ける', test: async (q) => (await q.tags()).includes('v2.0') },
      ],
      hints: [
        'まずは `feature/menu` で `git rebase main`。',
        '次に `git switch main` してから `git merge feature/menu`。一直線なので「Fast-forward」になります。',
        '最後に `git tag v2.0` です。',
      ],
    },
  ],
};
