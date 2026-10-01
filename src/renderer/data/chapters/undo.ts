import type { SetupStep } from '@shared/setup';
import type { Chapter } from '../lessonTypes';
import type { ProjectTemplate } from '../projects';
import { comment, commitAll, git, initialRepo, write } from '../setupHelpers';

const fileOf = (p: ProjectTemplate, path: string) => p.files.find((f) => f.path === path)?.content ?? '';

/** featureFile の末尾に1行足した内容 */
const withLine = (p: ProjectTemplate, text: string, base = fileOf(p, p.featureFile)) => `${base}${comment(p, text)}\n`;

/** HP の初期値を 0 にしてしまう「バグ」入りの内容 */
const buggy = (p: ProjectTemplate) => fileOf(p, p.hpFile).replace('100', '0');

const readmeWith = (p: ProjectTemplate, text: string) => `${fileOf(p, 'README.md')}\n${text}\n`;

/** origin に push 済みで、バグ入りのコミットまで送ってしまった状態 */
const pushedBug = (p: ProjectTemplate): SetupStep[] => [
  ...initialRepo(p),
  { kind: 'remote' },
  write('README.md', readmeWith(p, '## バージョン\n0.2')),
  ...commitAll('README にバージョンを追加'),
  write(p.hpFile, buggy(p)),
  ...commitAll('HP の初期値を変更'),
  git('push', '-u', 'origin', 'main'),
];

const hpRestored = async (q: { fileAt: (rev: string, path: string) => Promise<string | null> }, p: ProjectTemplate) =>
  (await q.fileAt('HEAD', p.hpFile))?.includes('100') ?? false;

export const undoChapter: Chapter = {
  id: 'undo',
  number: 4,
  title: '取り消し',
  summary: '失敗しても大丈夫。変更や履歴を元に戻す方法。',
  commands: ['restore', 'reset', 'revert', 'stash'],
  lessons: [
    {
      id: '4-1',
      title: '変更を取り消そう（restore）',
      description:
        '`{hpFile}` をうっかり壊してしまいました（HP が 0 に…）。さらに README.md を間違ってステージに乗せています。\n' +
        '`git restore` で、ファイルの変更とステージをそれぞれ元に戻しましょう。',
      setup: (p) => [
        ...initialRepo(p),
        write(p.hpFile, buggy(p)),
        write('README.md', readmeWith(p, 'メモ：まだ書きかけ')),
        git('add', 'README.md'),
      ],
      checks: [
        {
          label: '`{hpFile}` の変更を取り消して、最後のコミットの状態に戻す',
          test: (q, c) => !q.isModified(c.project.hpFile) && !q.isStaged(c.project.hpFile),
        },
        {
          label: 'README.md をステージから下ろす（変更は残す）',
          test: (q) => !q.isStaged('README.md') && q.isModified('README.md'),
        },
      ],
      hints: [
        '`git status` に、どう取り消せばいいかのヒントが英語で書いてあります。',
        '`git restore {hpFile}` で、ファイルを最後のコミットの状態に戻せます（変更は消えるので注意！）。',
        '`git restore --staged README.md` で、変更は残したままステージから下ろせます。',
      ],
    },
    {
      id: '4-2',
      title: '直前のコミットをやり直そう（reset）',
      description:
        '直前のコミットのメッセージを「typo」のまま送ってしまいました。まだ push していないので、やり直せます。\n' +
        '`git reset --soft HEAD~1` でコミットだけを取り消し、正しいメッセージでコミットし直しましょう。',
      setup: (p) => [
        ...initialRepo(p),
        write(p.featureFile, withLine(p, 'ジャンプの高さは 3')),
        ...commitAll('typo'),
      ],
      checks: [
        {
          label: '`git reset --soft HEAD~1` で直前のコミットを取り消す（変更はステージに残る）',
          test: async (q, c) => c.ran(/^git reset --soft/) && q.isStaged(c.project.featureFile),
        },
        {
          label: '分かりやすいメッセージでコミットし直す',
          test: async (q, c) =>
            c.ran(/^git (reset|commit --amend)/) && (await q.countCommits('HEAD')) === 2 && (await q.message()) !== 'typo',
        },
      ],
      hints: [
        '`HEAD~1` は「今のコミットの1つ前」という意味です。',
        '`--soft` を付けると、コミットだけ取り消して変更はステージに残ります。',
        'そのまま `git commit -m "ジャンプの高さを追加"` でコミットし直しましょう。（`git commit --amend -m "..."` でも直せます）',
      ],
    },
    {
      id: '4-3',
      title: 'push したコミットを打ち消そう（revert）',
      description:
        'HP を 0 にしてしまうバグ入りのコミットを、もう push してしまいました。\n' +
        'みんなに共有済みの履歴は消さずに、「打ち消すコミット」を新しく作る `git revert` で直しましょう。',
      setup: pushedBug,
      checks: [
        {
          label: '`git revert HEAD` でバグのコミットを打ち消す',
          test: async (q, c) => ((await q.message())?.startsWith('Revert') ?? false) && hpRestored(q, c.project),
        },
        {
          label: '`git push` で打ち消しをチームに共有する',
          test: async (q) => ((await q.message('origin/main'))?.startsWith('Revert') ?? false),
        },
      ],
      hints: [
        '`git log --oneline` で、どのコミットがバグか確かめましょう。今回は一番新しいコミットです。',
        '`git revert HEAD` で、最新のコミットと逆の変更を加える新しいコミットができます（メッセージは自動で入ります）。',
        'reset と違って履歴を消さないので、push 済みでも安全です。最後に `git push` しましょう。',
      ],
    },
    {
      id: '4-4',
      title: '作業を一時退避しよう（stash）',
      description:
        '`{featureFile}` を編集している途中で、急いで別の作業をすることになりました。でも、まだコミットしたくない…。\n' +
        '`git stash` で作業を一時的にしまって、あとで取り出しましょう。',
      setup: (p) => [...initialRepo(p), write(p.featureFile, withLine(p, '作業中：ダッシュ機能'))],
      checks: [
        { label: '`git stash` で作業中の変更をしまう', test: async (q) => (await q.stashCount()) >= 1 && q.isClean },
        { label: '`git stash list` でしまった変更を確かめる', test: (_q, c) => c.ran(/^git stash list/) },
        {
          label: '`git stash pop` で取り出して作業に戻る',
          test: async (q, c) => c.ran(/^git stash pop/) && (await q.stashCount()) === 0 && q.isModified(c.project.featureFile),
        },
      ],
      hints: [
        '`git stash` を打つと、変更が消えたように見えますが、ちゃんとしまわれています。エディタの中身も見てみましょう。',
        '`git stash list` で、しまった変更の一覧が見られます。',
        '`git stash pop` で、しまった変更を取り出して元に戻せます。',
      ],
    },
    {
      id: '4-5',
      title: '消えたコミットを取り戻そう（reflog）',
      description:
        'しまった！ `git reset --hard` で、大事なコミットを2つ消してしまいました。\n' +
        'でも大丈夫。Git は HEAD が動いた記録（reflog）を残しています。そこから取り戻しましょう。',
      setup: (p) => [
        ...initialRepo(p),
        write(p.featureFile, withLine(p, 'ジャンプ機能')),
        ...commitAll('ジャンプ機能を追加'),
        write(p.featureFile, withLine(p, 'ダッシュ機能', withLine(p, 'ジャンプ機能'))),
        ...commitAll('ダッシュ機能を追加'),
        git('reset', '--hard', 'HEAD~2'),
      ],
      checks: [
        { label: '`git reflog` で HEAD の移動の記録を見る', test: (_q, c) => c.ran(/^git reflog/) },
        {
          label: '消えたコミットまで戻る',
          test: async (q) => (await q.message()) === 'ダッシュ機能を追加',
        },
      ],
      hints: [
        '`git log` には消えたコミットは出てきません。`git reflog` を使いましょう。',
        'reflog の `HEAD@{1}` が「reset する直前」の位置です。',
        '`git reset --hard HEAD@{1}` で、その位置まで戻れます。',
      ],
    },
    {
      id: '4-6',
      title: 'まとめ：失敗を全部片付けよう',
      description:
        '散らかった状況です！ `{mainFile}` には要らない変更、そして push 済みの最新コミットにはバグがあります。\n' +
        'この章で覚えたコマンドを使って、全部きれいに片付けましょう。',
      setup: (p) => [...pushedBug(p), write(p.mainFile, `${fileOf(p, p.mainFile)}${comment(p, '要らないテストコード')}\n`)],
      checks: [
        { label: '`{mainFile}` の要らない変更を取り消す', test: (q, c) => !q.isModified(c.project.mainFile) },
        {
          label: 'バグのコミットを打ち消す',
          test: async (q, c) => ((await q.message())?.startsWith('Revert') ?? false) && hpRestored(q, c.project),
        },
        { label: 'チームに共有する', test: async (q) => ((await q.message('origin/main'))?.startsWith('Revert') ?? false) },
      ],
      hints: [
        'まずは `git status` と `git log --oneline` で状況を確かめましょう。',
        '作業中の変更を捨てるのは `git restore`、push 済みのコミットを打ち消すのは `git revert` です。',
        '最後に `git push` で送れば完了です。',
      ],
    },
  ],
};
