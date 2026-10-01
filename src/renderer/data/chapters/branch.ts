import type { Chapter } from '../lessonTypes';
import type { ProjectTemplate } from '../projects';
import { appendAndCommit, comment, commitAll, git, initialRepo, write } from '../setupHelpers';

const fileOf = (p: ProjectTemplate, path: string) => p.files.find((f) => f.path === path)?.content ?? '';

/** featureFile の HP 初期値を書き換えた内容（コンフリクトを起こすため、同じ行を変える） */
const withHp = (p: ProjectTemplate, hp: number) => fileOf(p, p.featureFile).replace('100', String(hp));

export const branchChapter: Chapter = {
  id: 'branch',
  number: 2,
  title: 'ブランチ',
  summary: '作業を枝分かれさせて並行開発。コンフリクトの直し方も学ぶ。',
  commands: ['branch', 'switch', 'merge'],
  lessons: [
    {
      id: '2-1',
      title: 'ブランチってなに？',
      description:
        'ブランチは「作業の枝分かれ」です。本流の `main` を壊さずに、別の枝で新しい機能を試せます。\n' +
        'まずはブランチの一覧を見て、新しいブランチを1つ作ってみましょう。',
      setup: initialRepo,
      checks: [
        { label: '`git branch` でブランチの一覧を見る', test: (_q, c) => c.ran(/^git branch$/) },
        { label: '`feature/title` ブランチを作る', test: (q) => q.hasBranch('feature/title') },
        {
          label: 'もう一度 `git branch` で増えたことを確かめる',
          test: (_q, c) => c.commands.filter((x) => x === 'git branch').length >= 2,
        },
      ],
      hints: [
        '`git branch` だけを打つと一覧が出ます。`*` が付いているのが今いるブランチです。',
        '`git branch feature/title` で新しいブランチを作れます（作るだけで、移動はしません）。',
        'ブランチ名は「何の作業か」が分かる名前にしましょう。`feature/〜` は新機能によく使う名前です。',
      ],
    },
    {
      id: '2-2',
      title: 'ブランチを切り替えよう',
      description:
        '`feature/sound` ブランチがすでに用意されています。\n' +
        'ブランチを行き来して、コミットグラフの `HEAD`（今いる場所）が動くのを見てみましょう。',
      setup: (p) => [...initialRepo(p), git('branch', 'feature/sound')],
      checks: [
        { label: '`feature/sound` に切り替える', test: (q) => q.currentBranch === 'feature/sound' },
        {
          label: '`main` に戻る',
          test: (q, c) => q.currentBranch === 'main' && c.ran(/^git (switch|checkout) main$/),
        },
        {
          label: '新しいブランチ `feature/menu` を作って、そのまま切り替える',
          test: (q) => q.currentBranch === 'feature/menu',
        },
      ],
      hints: [
        '`git switch feature/sound` で切り替えられます。',
        '`git switch main` で本流に戻ります。',
        '`git switch -c feature/menu` は「作って切り替える」を1回でできます。',
      ],
    },
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
    {
      id: '2-4',
      title: 'ブランチをマージしよう',
      description:
        '`feature/jump` ブランチでジャンプ機能が完成しました。\n' +
        '本流の `main` に取り込んで（マージして）、使い終わったブランチを片付けましょう。',
      setup: (p) => [
        ...initialRepo(p),
        git('switch', '-c', 'feature/jump'),
        write(p.featureFile, `${fileOf(p, p.featureFile)}${comment(p, 'ジャンプ機能')}\n`),
        ...commitAll('ジャンプ機能を追加'),
        git('switch', 'main'),
      ],
      checks: [
        { label: '`git log --oneline --all` で全部のブランチの履歴を見る', test: (_q, c) => c.ran(/^git log .*--all/) },
        { label: '`main` に `feature/jump` をマージする', test: (q) => q.isMergedInto('feature/jump', 'main') },
        {
          label: '使い終わった `feature/jump` ブランチを消す',
          test: async (q) => !(await q.hasBranch('feature/jump')) && (await q.countCommits('main')) >= 2,
        },
      ],
      hints: [
        'マージは「取り込む側」のブランチにいる状態で実行します。今は `main` にいます。',
        '`git merge feature/jump` でマージできます。',
        'マージ済みのブランチは `git branch -d feature/jump` で消せます。',
      ],
    },
    {
      id: '2-5',
      title: 'コンフリクトを解決しよう',
      description:
        '`main` と `feature/hp` の両方で、同じ行（HP の初期値）が別々に変更されています。\n' +
        'マージすると Git はどちらを選ぶか決められず「コンフリクト（衝突）」になります。エディタで直してマージを完了させましょう。',
      setup: (p) => [
        ...initialRepo(p),
        git('switch', '-c', 'feature/hp'),
        write(p.featureFile, withHp(p, 150)),
        ...commitAll('HP を 150 に増やす'),
        git('switch', 'main'),
        write(p.featureFile, withHp(p, 120)),
        ...commitAll('HP を 120 に調整'),
      ],
      checks: [
        { label: '`git merge feature/hp` でマージしてみる', test: (_q, c) => c.ran(/^git merge feature\/hp/) },
        {
          label: 'エディタで `<<<<<<<` 〜 `>>>>>>>` を消して直し、`git add` する',
          // main 側をそのまま残すと HEAD と同じ内容になりステージに差分が出ないので、衝突が消えたかと add したかで見る
          test: async (q, c) =>
            c.ran(/^git merge feature\/hp/) &&
            !q.snapshot.working.some((f) => f.state === 'conflicted') &&
            (c.ran(/^git add/) || (await q.parentCount('HEAD')) === 2),
        },
        { label: 'コミットしてマージを完了する', test: async (q) => (await q.parentCount('HEAD')) === 2 },
      ],
      hints: [
        '`<<<<<<< HEAD` から `=======` までが今のブランチ（main）、`=======` から `>>>>>>>` までが取り込もうとしたブランチの内容です。',
        'どちらの値にするか決めて、`<<<<<<<` `=======` `>>>>>>>` の行も含めて消し、正しい1行だけを残します。',
        '直したら `git add {featureFile}`、最後に `git commit` でマージ完了です（メッセージは自動で入ります）。',
      ],
    },
  ],
};
