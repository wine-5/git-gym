import { stub, type Chapter } from '../lessonTypes';
import { appendAndCommit, initialRepo } from '../setupHelpers';

export const branchChapter: Chapter = {
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
          test: async (q, { project: p }) => {
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
};
