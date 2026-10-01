import type { SetupStep } from '@shared/setup';
import type { Chapter } from '../lessonTypes';
import type { ProjectTemplate } from '../projects';
import { comment, commitAll, git, initialRepo, write } from '../setupHelpers';

const fileOf = (p: ProjectTemplate, path: string) => p.files.find((f) => f.path === path)?.content ?? '';
const readmeWith = (p: ProjectTemplate, text: string) => `${fileOf(p, 'README.md')}\n${text}\n`;

const withRemote = (p: ProjectTemplate): SetupStep[] => [
  ...initialRepo(p),
  { kind: 'remote' },
  git('push', '-u', 'origin', 'main'),
];

const teammate = (message: string, path: string, content: string): SetupStep => ({
  kind: 'teammate',
  message,
  files: [{ path, content }],
});

export const teamChapter: Chapter = {
  id: 'team',
  number: 6,
  title: 'チーム開発',
  summary: '仲間が先に push していた！ 実践的な総合演習。',
  commands: ['総合演習'],
  lessons: [
    {
      id: '6-1',
      title: '演習1：いつもの開発の流れ',
      description:
        'チーム開発の基本の流れを、最初から最後まで自分の力でやってみましょう。\n' +
        '① 最新の `main` を取り込む → ② `feature/item` ブランチを作る → ③ `{featureFile}` を編集してコミット → ④ ブランチを push',
      setup: (p) => [
        ...withRemote(p),
        teammate('README に遊び方を追加', 'README.md', readmeWith(p, '## 遊び方\nスペースキーでジャンプ')),
      ],
      checks: [
        {
          label: '最新の `main` を取り込む',
          test: async (q) => (await q.countCommits('main')) >= 2,
        },
        {
          label: '`feature/item` ブランチで `{featureFile}` を編集してコミットする',
          test: async (q, c) => {
            const out = await q.run(['log', '--format=', '--name-only', 'main..feature/item']);
            return out !== null && out.split('\n').includes(c.project.featureFile);
          },
        },
        {
          label: '`feature/item` をリモートに push する',
          test: async (q) => (await q.remoteBranches()).includes('origin/feature/item'),
        },
      ],
      hints: [
        '`git pull` で main を最新にしてから始めるのが基本です。',
        '`git switch -c feature/item` → 編集 → `git add` → `git commit -m "..."`',
        '初めての push は `git push -u origin feature/item` です。',
      ],
    },
    {
      id: '6-2',
      title: '演習2：push が断られた！',
      description:
        '`{featureFile}` を直してコミットしました。さっそく `git push` …すると断られてしまいます。\n' +
        '実はチームメイトが先に push していたのです。慌てずに、仲間の変更を取り込んでから送り直しましょう。',
      setup: (p) => [
        ...withRemote(p),
        teammate('README にクレジットを追加', 'README.md', readmeWith(p, '## クレジット\nチームメイト')),
        write(p.featureFile, `${fileOf(p, p.featureFile)}${comment(p, 'ダメージ表示を追加')}\n`),
        ...commitAll('ダメージ表示を追加'),
      ],
      checks: [
        { label: '`git push` してみる（断られる）', test: (_q, c) => c.tried(/^git push/) },
        {
          label: '`git pull` で仲間の変更を取り込む',
          test: async (q) => (await q.fileAt('HEAD', 'README.md'))?.includes('クレジット') ?? false,
        },
        {
          label: 'もう一度 `git push` して、両方の変更をリモートにそろえる',
          test: async (q) =>
            ((await q.fileAt('origin/main', 'README.md'))?.includes('クレジット') ?? false) &&
            (await q.isMergedInto('main', 'origin/main')),
        },
      ],
      hints: [
        '`[rejected]` と出たら「リモートに自分の知らない変更がある」という意味です。',
        '`git pull` で取り込みます。別々のファイルを変えているので自動でマージされます（メッセージは自動で入ります）。',
        '取り込めたら、もう一度 `git push` です。',
      ],
    },
    {
      id: '6-3',
      title: '演習3：仲間とコンフリクト',
      description:
        'あなたは `{hpFile}` の HP の初期値を 120 に、チームメイトは 150 に変えて、先に push しました。同じ行なのでコンフリクトになります。\n' +
        'pull して衝突を直し、チームと話し合った結果の「130」にしてから push しましょう。',
      setup: (p) => [
        ...withRemote(p),
        teammate('HP を 150 に増やす', p.hpFile, fileOf(p, p.hpFile).replace('100', '150')),
        write(p.hpFile, fileOf(p, p.hpFile).replace('100', '120')),
        ...commitAll('HP を 120 に調整'),
      ],
      checks: [
        {
          label: '`git pull` してコンフリクトを起こす',
          test: (q, c) => q.snapshot.working.some((f) => f.state === 'conflicted') || c.ran(/^git (pull|merge)/),
        },
        {
          label: 'HP を 130 にして衝突を解決し、マージをコミットする',
          test: async (q, c) =>
            (await q.parentCount('HEAD')) === 2 &&
            ((await q.fileAt('HEAD', c.project.hpFile))?.includes('130') ?? false),
        },
        {
          label: '`git push` でチームにそろえる',
          test: async (q) => (await q.parentCount('origin/main')) === 2,
        },
      ],
      hints: [
        '`git pull` すると CONFLICT と出ます。エディタで色分けされた部分を見てみましょう。',
        '`<<<<<<<` から `>>>>>>>` までを、HP が 130 の1行だけになるように書き換えます。',
        '直したら `git add {hpFile}` → `git commit` → `git push` です。',
      ],
    },
  ],
};
