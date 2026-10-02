import type { SetupStep } from '@shared/setup';
import { includesRepoText } from '@i18n/repoText';
import type { Chapter } from '../lessonTypes';
import type { ProjectTemplate } from '../projects';
import { git, initialRepo } from '../setupHelpers';

const fileOf = (p: ProjectTemplate, path: string) => p.files.find((f) => f.path === path)?.content ?? '';

/** 最初のコミットを origin（練習用の GitHub 代わり）に push 済みの状態 */
const withRemote = (p: ProjectTemplate): SetupStep[] => [
  ...initialRepo(p),
  { kind: 'remote' },
  git('push', '-u', 'origin', 'main'),
];

/** チームメイトが README に追記して push した状態 */
const teammatePushed = (p: ProjectTemplate): SetupStep[] => [
  ...withRemote(p),
  {
    kind: 'teammate',
    message: 'README にチームメンバーを追加',
    files: [{ path: 'README.md', content: `${fileOf(p, 'README.md')}\n## チーム\n- あなた\n- チームメイト\n` }],
  },
];

export const remoteChapter: Chapter = {
  id: 'remote',
  number: 3,
  title: 'リモート',
  summary: 'チームとコードを共有する。push と pull の流れを体験。',
  commands: ['clone', 'push', 'pull', 'fetch'],
  lessons: [
    {
      id: '3-1',
      title: 'リポジトリを複製しよう（clone）',
      description:
        'チームのリポジトリが「リモート」（GitHub のような共有場所）にあります。まずは手元に複製（clone）しましょう。\n' +
        'このアプリでは練習用のリモートを `{remoteUrl}` に用意しています。最後の `.` は「今いるフォルダに」という意味です。',
      setup: (p) => [...withRemote(p), { kind: 'clear' }],
      checks: [
        { label: '`git clone {remoteUrl} .` で複製する', test: (q) => q.isRepo && q.commitCount >= 1 },
        { label: '`git remote -v` で複製元（origin）を確かめる', test: (_q, c) => c.ran(/^git remote -v/) },
        { label: '`git log --oneline` で履歴も一緒に届いたことを確かめる', test: (_q, c) => c.ran(/^git log/) },
      ],
      hints: [
        '`git clone {remoteUrl} .` と打ちましょう。本物の GitHub なら URL は https://github.com/... になります。',
        '複製元は自動で `origin` という名前で登録されます。`git remote -v` で確認できます。',
        'clone するとファイルだけでなく、これまでの履歴もすべて手元に来ます。',
      ],
    },
    {
      id: '3-2',
      title: '変更を送ろう（push）',
      description:
        '手元でコミットしただけでは、チームのみんなには届きません。\n' +
        '`{featureFile}` を編集してコミットし、`git push` でリモートに送りましょう。コミットグラフの `origin/main` が追いついてくるのを見てください。',
      setup: withRemote,
      checks: [
        { label: '`{featureFile}` を編集してコミットする', test: async (q) => (await q.countCommits('main')) >= 2 },
        {
          label: '`git push` でリモートに送る',
          test: async (q) => (await q.countCommits('origin/main')) >= 2,
        },
        { label: '`git status` で「up to date」になったことを確かめる', test: (_q, c) => c.ran(/^git status/) },
      ],
      hints: [
        'まずはいつも通り `git add` → `git commit -m "..."` です。',
        'コミットしたら `git push` で送ります。`origin/main` はリモートの main の位置を表しています。',
        '`git status` に `Your branch is up to date with \'origin/main\'` と出れば送れています。',
      ],
    },
    {
      id: '3-3',
      title: '仲間の変更を取り込もう（pull）',
      description:
        'チームメイトが README を更新して push しました。あなたの手元にはまだその変更がありません。\n' +
        '`git pull` で取り込んで、最新の状態にしましょう。',
      setup: teammatePushed,
      checks: [
        { label: '`git pull` で取り込む', test: async (q) => includesRepoText(await q.fileAt('HEAD', 'README.md'), 'チームメイト') },
        { label: '`git log --oneline` で仲間のコミットを確かめる', test: (_q, c) => c.ran(/^git log/) },
        { label: '`cat README.md` で中身も確かめる', test: (_q, c) => c.ran(/^(cat|type) README\.md/) },
      ],
      hints: [
        '`git pull` は「リモートから取ってきて（fetch）、合体する（merge）」をまとめて行うコマンドです。',
        '`git log --oneline` で、チームメイトのコミットが増えているはずです。',
        'エディタの README.md も自動で新しい内容になっています。',
      ],
    },
    {
      id: '3-4',
      title: '取ってくるだけにしよう（fetch）',
      description:
        'またチームメイトが push しました。今度はいきなり取り込まずに、まず `git fetch` で「何が変わったか」を見てから取り込みます。\n' +
        '慎重に進めたいときに便利な方法です。',
      setup: teammatePushed,
      checks: [
        { label: '`git fetch` でリモートの情報だけ取ってくる', test: async (q) => (await q.countCommits('origin/main')) >= 2 },
        { label: '`git log --oneline --all` で `origin/main` が先に進んでいるのを見る', test: (_q, c) => c.ran(/^git log .*--all/) },
        {
          label: '`git merge origin/main` で取り込む',
          // fetch 前は origin/main と main が同じなので「取り込み済み」に見える。仲間のコミットが main に来たかで見る
          test: async (q) => (await q.countCommits('main')) >= 2 && q.isMergedInto('origin/main', 'main'),
        },
      ],
      hints: [
        '`git fetch` はリモートの最新情報を取ってくるだけで、手元のファイルは変えません。',
        'コミットグラフで `origin/main` が `main` より上にあるのが見えるはずです。',
        '確認できたら `git merge origin/main` で取り込みます（pull = fetch + merge です）。',
      ],
    },
    {
      id: '3-5',
      title: 'ブランチを送ろう',
      description:
        'チーム開発では、main に直接 push せず、自分のブランチを push して見てもらいます。\n' +
        '`feature/score` ブランチで作業して、リモートに送りましょう。',
      setup: withRemote,
      checks: [
        {
          label: '`feature/score` ブランチを作ってコミットする',
          test: async (q) => (await q.countCommits('feature/score')) >= 2,
        },
        {
          label: '`git push -u origin feature/score` で送る',
          test: async (q) => (await q.remoteBranches()).includes('origin/feature/score'),
        },
        { label: '`git branch -a` でリモートのブランチも確かめる', test: (_q, c) => c.ran(/^git branch .*(-a|-r|--all|--remotes)/) },
      ],
      hints: [
        '`git switch -c feature/score` で作って切り替え、編集してコミットしましょう。',
        '新しいブランチを初めて送るときは `-u`（追跡の設定）を付けます。次からは `git push` だけで送れます。',
        '`git branch -a` で `remotes/origin/feature/score` が出れば成功です。',
      ],
    },
  ],
};
