import type { Chapter } from '../lessonTypes';
import type { ProjectTemplate } from '../projects';
import { comment, commitAll, git, initialRepo, write, writeProject } from '../setupHelpers';

/** 雛形を置いて init しただけの状態 */
const initOnly = (p: ProjectTemplate) => [...writeProject(p), git('init', '-b', 'main')];

/** featureFile の末尾に1行足した内容 */
const withLine = (p: ProjectTemplate, text: string) => {
  const base = p.files.find((f) => f.path === p.featureFile)?.content ?? '';
  return `${base}${comment(p, text)}\n`;
};

export const basicsChapter: Chapter = {
  id: 'basics',
  number: 1,
  title: 'はじめの一歩',
  summary: '変更を記録する基本の流れ。add と commit の意味を理解しよう。',
  commands: ['init', 'status', 'add', 'commit', 'log', 'diff'],
  lessons: [
    {
      id: '1-1',
      title: 'リポジトリを作ろう',
      description:
        'このフォルダにはゲームのコードがありますが、まだ Git で管理されていません。\n' +
        'まずは `git init` で、変更を記録していくための「リポジトリ」を作りましょう。',
      checks: [
        { label: '`git init` でリポジトリを作る', test: (q) => q.isRepo },
        { label: '`ls -a` で `.git` フォルダができたことを確かめる', test: (_q, c) => c.ran(/^(ls|dir) .*-a/) },
      ],
      hints: [
        'リポジトリを作るコマンドは `git init` です。',
        '`.` で始まるファイルやフォルダはふだん隠れています。`ls -a` で全部表示できます。',
        '`.git` フォルダの中に、これからの変更の記録がすべて保存されます。',
      ],
    },
    {
      id: '1-2',
      title: '状態を確認しよう',
      description:
        'Git を使うときに一番よく打つのが `git status` です。\n' +
        'いまどのファイルが変更されていて、何がまだ記録されていないかを教えてくれます。迷ったらまず `git status`！',
      setup: initOnly,
      checks: [
        { label: '`git status` で状態を見る', test: (_q, c) => c.ran(/^git status$/) },
        { label: '`git status -s` で短い表示も見てみる', test: (_q, c) => c.ran(/^git status (-s|--short)/) },
      ],
      hints: [
        '`git status` と打ってみましょう。赤いファイルは「Git がまだ記録していないファイル」です。',
        '`-s` を付けると1行ずつの短い表示になります。`??` は「まだ追跡していない」という意味です。',
      ],
    },
    {
      id: '1-3',
      title: 'ステージに乗せよう',
      description:
        'コミット（記録）する前に、「次の記録に入れるファイル」を選んでステージに乗せます。\n' +
        'まずは `{featureFile}` だけを乗せて、そのあと残りもまとめて乗せましょう。右下の「ファイルの居場所」も見てみてください。',
      setup: initOnly,
      checks: [
        { label: '`{featureFile}` だけをステージに乗せる', test: (q, c) => q.isStaged(c.project.featureFile) },
        {
          label: '残りのファイルもまとめてステージに乗せる',
          test: (q) => q.snapshot.working.length === 0 && q.snapshot.staged.length > 1,
        },
        { label: '`git status` でステージに乗ったことを確かめる', test: (_q, c) => c.ran(/^git status/) },
      ],
      hints: [
        '1つのファイルを乗せるには `git add {featureFile}` です。',
        '`git add .` でフォルダ内の変更をまとめて乗せられます（`.` は「今いるフォルダ」という意味）。',
        'ステージに乗ったファイルは `git status` で緑色になります。',
      ],
    },
    {
      id: '1-4',
      title: '初めてのコミット',
      description:
        'ステージに乗せたファイルを、いよいよ記録（コミット）します。\n' +
        'コミットには「何をしたか」を書いたメッセージを必ず付けます。右上のコミットグラフに丸が1つ増えるはずです。',
      setup: (p) => [...initOnly(p), git('add', '-A')],
      checks: [
        { label: 'メッセージを付けてコミットする', test: (q) => q.commitCount >= 1 },
        { label: '`git log` でコミットが記録されたことを確かめる', test: (_q, c) => c.ran(/^git log/) },
      ],
      hints: [
        '`git commit -m "最初のコミット"` のように、`-m` のあとにメッセージを書きます。',
        'メッセージは「何をしたか」が後から分かるように書きましょう。',
        '`git log` で記録の一覧が見られます。',
      ],
    },
    {
      id: '1-5',
      title: '履歴を見よう',
      description:
        'このリポジトリには、すでにいくつかのコミットがあります。\n' +
        '`git log` を使って、誰がいつ何をしたのかを読み取ってみましょう。',
      setup: (p) => [
        ...initialRepo(p),
        write(p.featureFile, withLine(p, 'TODO: ジャンプを作る')),
        ...commitAll('TODO コメントを追加'),
        write('README.md', `${p.files.find((f) => f.path === 'README.md')?.content ?? ''}\n## 遊び方\n矢印キーで移動します。\n`),
        ...commitAll('README に遊び方を追加'),
      ],
      checks: [
        { label: '`git log` で履歴を見る', test: (_q, c) => c.ran(/^git log$/) },
        { label: '`git log --oneline` で1行ずつ表示する', test: (_q, c) => c.ran(/^git log .*--oneline/) },
        { label: '`git show` で最新のコミットの中身を見る', test: (_q, c) => c.ran(/^git show/) },
      ],
      hints: [
        '`git log` は新しい順に表示されます。',
        '`--oneline` を付けると、1コミット1行のコンパクトな表示になります。',
        '`git show` で、最新のコミットでどこが変わったかが見られます。',
      ],
    },
    {
      id: '1-6',
      title: '差分を見よう',
      description:
        '`{featureFile}` に、まだコミットしていない変更があります。\n' +
        'コミットする前に `git diff` で「何を変えたか」を確認するのは、とても大事な習慣です。',
      setup: (p) => [...initialRepo(p), write(p.featureFile, withLine(p, 'ジャンプの高さは 3'))],
      checks: [
        { label: '`git diff` で変更内容を見る', test: (_q, c) => c.ran(/^git diff$|^git diff (?!.*--(staged|cached))/) },
        { label: '`{featureFile}` をステージに乗せる', test: (q, c) => q.isStaged(c.project.featureFile) },
        { label: '`git diff --staged` でステージの中身を見る', test: (_q, c) => c.ran(/^git diff .*--(staged|cached)/) },
        { label: 'コミットする', test: (q) => q.isClean && q.commitCount >= 2 },
      ],
      hints: [
        '`+` で始まる緑の行が追加、`-` で始まる赤の行が削除です。',
        'ステージに乗せると `git diff` には出なくなります。乗せた分は `git diff --staged` で見られます。',
        '最後は `git commit -m "メッセージ"` でコミットしましょう。',
      ],
    },
  ],
};
