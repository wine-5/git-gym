import type { CommandResult } from '@shared/terminal';
import { currentLocale, type Locale } from '@i18n/locale';
import { stripAnsi } from './ansi';

const GIT_SUBCOMMANDS = new Set([
  'init', 'status', 'add', 'commit', 'log', 'diff', 'branch', 'switch', 'checkout', 'merge', 'restore',
  'reset', 'revert', 'stash', 'push', 'pull', 'fetch', 'clone', 'remote', 'tag', 'rebase', 'cherry-pick', 'show', 'config',
]);

/** 言語ごとのヒント文 */
type Localized = Record<Locale, string>;

interface Rule {
  pattern: RegExp;
  hint: (match: RegExpMatchArray) => Localized;
  /** このサブコマンドのときだけ出す（git status の説明文などに反応しないように） */
  only?: string[];
}

/** git の出力（英語）に対応する、初心者向けのヒント */
const RULES: Rule[] = [
  {
    pattern: /The most similar commands? (?:is|are)\s+(\S+)/,
    hint: (m) => ({
      ja: `もしかして git ${m[1]} ですか？ スペルを確認してみましょう`,
      en: `Did you mean git ${m[1]}? Check the spelling.`,
      zh: `你是不是想输入 git ${m[1]}？检查一下拼写吧`,
      ko: `혹시 git ${m[1]} 인가요? 철자를 확인해 보세요`,
    }),
  },
  {
    pattern: /not a git repository/,
    hint: () => ({
      ja: 'まだ Git のリポジトリではありません。まず git init で作りましょう',
      en: 'This folder is not a Git repository yet. Create one first with git init.',
      zh: '这里还不是 Git 仓库。先用 git init 创建一个吧',
      ko: '아직 Git 저장소가 아닙니다. 먼저 git init 으로 만들어 보세요',
    }),
  },
  {
    pattern: /Aborting commit due to empty commit message/,
    hint: () => ({
      ja: 'コミットにはメッセージが必要です。git commit -m "メッセージ" のように -m を付けましょう',
      en: 'A commit needs a message. Add -m, like git commit -m "message".',
      zh: '提交需要附带说明。像 git commit -m "说明" 这样加上 -m 吧',
      ko: '커밋에는 메시지가 필요합니다. git commit -m "메시지" 처럼 -m 을 붙여 보세요',
    }),
  },
  {
    pattern: /nothing added to commit but untracked files present/,
    hint: () => ({
      ja: 'ステージに何もありません。git add <ファイル名> でステージに乗せてからコミットしましょう',
      en: 'Nothing is staged. Stage files with git add <file> before committing.',
      zh: '暂存区是空的。先用 git add <文件名> 暂存，再提交吧',
      ko: '스테이지에 아무것도 없습니다. git add <파일명> 으로 스테이지에 올린 뒤 커밋하세요',
    }),
    only: ['commit'],
  },
  {
    pattern: /no changes added to commit/,
    hint: () => ({
      ja: '変更はありますが、まだステージに乗っていません。先に git add しましょう',
      en: 'You have changes, but they are not staged yet. Run git add first.',
      zh: '有改动，但还没有暂存。先执行 git add 吧',
      ko: '변경 사항은 있지만 아직 스테이지에 올라가지 않았습니다. 먼저 git add 하세요',
    }),
    only: ['commit'],
  },
  {
    pattern: /nothing to commit, working tree clean/,
    hint: () => ({
      ja: 'コミットする変更がありません。ファイルを編集してから試しましょう',
      en: 'There is nothing to commit. Edit a file and try again.',
      zh: '没有可提交的改动。先编辑文件再试试吧',
      ko: '커밋할 변경 사항이 없습니다. 파일을 수정한 뒤 다시 시도하세요',
    }),
    only: ['commit'],
  },
  {
    pattern: /pathspec '(.+?)' did not match any file/,
    hint: (m) => ({
      ja: `「${m[1]}」というファイル（またはブランチ）が見つかりません。ls や git branch で名前を確認しましょう`,
      en: `Can't find a file (or branch) named "${m[1]}". Check the name with ls or git branch.`,
      zh: `找不到名为“${m[1]}”的文件（或分支）。用 ls 或 git branch 确认一下名称吧`,
      ko: `"${m[1]}" 라는 파일(또는 브랜치)을 찾을 수 없습니다. ls 나 git branch 로 이름을 확인하세요`,
    }),
  },
  {
    pattern: /invalid reference: (\S+)/,
    hint: (m) => ({
      ja: `「${m[1]}」というブランチはありません。git branch で一覧を確認しましょう。新しく作るなら git switch -c ${m[1]}`,
      en: `There is no branch named "${m[1]}". Check the list with git branch. To create it, use git switch -c ${m[1]}`,
      zh: `没有名为“${m[1]}”的分支。用 git branch 查看列表吧。要新建的话用 git switch -c ${m[1]}`,
      ko: `"${m[1]}" 라는 브랜치는 없습니다. git branch 로 목록을 확인하세요. 새로 만들려면 git switch -c ${m[1]}`,
    }),
  },
  {
    pattern: /a branch named '(.+?)' already exists/,
    hint: (m) => ({
      ja: `「${m[1]}」はもうあります。切り替えるなら git switch ${m[1]}`,
      en: `"${m[1]}" already exists. To switch to it, use git switch ${m[1]}`,
      zh: `“${m[1]}”已经存在。要切换过去的话用 git switch ${m[1]}`,
      ko: `"${m[1]}" 는 이미 있습니다. 전환하려면 git switch ${m[1]}`,
    }),
  },
  {
    pattern: /Your local changes to the following files would be overwritten/,
    hint: () => ({
      ja: 'まだコミットしていない変更があるので切り替えられません。先にコミットするか git stash で一時退避しましょう',
      en: "You can't switch because you have uncommitted changes. Commit them first, or set them aside with git stash.",
      zh: '有尚未提交的改动，所以无法切换。先提交，或用 git stash 暂时保存起来吧',
      ko: '아직 커밋하지 않은 변경 사항이 있어서 전환할 수 없습니다. 먼저 커밋하거나 git stash 로 잠시 치워 두세요',
    }),
  },
  {
    pattern: /CONFLICT/,
    hint: () => ({
      ja: 'コンフリクト（衝突）が起きました。エディタで <<<<<<< 〜 >>>>>>> の部分を直してから git add → git commit しましょう',
      en: 'A conflict happened. Fix the <<<<<<< ... >>>>>>> parts in the editor, then git add → git commit.',
      zh: '发生了冲突。在编辑器中修改 <<<<<<< ~ >>>>>>> 部分，然后执行 git add → git commit 吧',
      ko: '충돌(컨플릭트)이 발생했습니다. 에디터에서 <<<<<<< ~ >>>>>>> 부분을 고친 뒤 git add → git commit 하세요',
    }),
  },
  {
    pattern: /\[rejected\]|failed to push some refs/,
    hint: () => ({
      ja: 'リモートに自分の知らない変更があるので push できません。先に git pull で取り込みましょう',
      en: "The push was rejected because the remote has changes you don't have yet. Run git pull first.",
      zh: '远程有你本地没有的改动，所以无法 push。先用 git pull 拉取下来吧',
      ko: '원격에 내가 모르는 변경 사항이 있어서 push 할 수 없습니다. 먼저 git pull 로 가져오세요',
    }),
  },
  {
    pattern: /has no upstream branch/,
    hint: () => ({
      ja: '初めて push するブランチです。git push -u origin <ブランチ名> で送りましょう',
      en: 'This branch is being pushed for the first time. Use git push -u origin <branch>.',
      zh: '这是第一次 push 这个分支。用 git push -u origin <分支名> 推送吧',
      ko: '처음 push 하는 브랜치입니다. git push -u origin <브랜치명> 으로 보내세요',
    }),
  },
  {
    pattern: /Please tell me who you are/,
    hint: () => ({
      ja: 'git config user.name と user.email を設定しましょう',
      en: 'Set your git config user.name and user.email.',
      zh: '先用 git config 设置 user.name 和 user.email 吧',
      ko: 'git config 로 user.name 과 user.email 을 설정하세요',
    }),
  },
  {
    pattern: /unknown (?:option|switch)/,
    hint: () => ({
      ja: 'オプションのつづりを確認しましょう。-h を付けると使い方が表示されます',
      en: 'Check the spelling of the option. Add -h to see how to use the command.',
      zh: '检查一下选项的拼写吧。加上 -h 可以查看用法',
      ko: '옵션 철자를 확인하세요. -h 를 붙이면 사용법이 표시됩니다',
    }),
  },
  {
    pattern: /You have not concluded your merge|MERGE_HEAD exists/,
    hint: () => ({
      ja: 'マージの途中です。コンフリクトを直して git add → git commit するか、git merge --abort でやめましょう',
      en: "You're in the middle of a merge. Fix the conflicts and git add → git commit, or stop with git merge --abort.",
      zh: '正在合并中。解决冲突后执行 git add → git commit，或用 git merge --abort 放弃合并',
      ko: '병합(머지) 중입니다. 충돌을 고친 뒤 git add → git commit 하거나, git merge --abort 로 그만두세요',
    }),
  },
];

/** 打ったコマンドと結果から、出すべきヒントを1つ返す（文言は今の表示言語） */
export function hintFor(line: string, result: CommandResult): string | null {
  const locale = currentLocale();
  const first = line.trim().split(/\s+/)[0];
  if (result.exitCode === 127 && GIT_SUBCOMMANDS.has(first)) {
    const cmd = `git ${line.trim()}`;
    const missingGit: Localized = {
      ja: `Git のコマンドは先頭に git を付けます: ${cmd}`,
      en: `Git commands start with git: ${cmd}`,
      zh: `Git 命令要以 git 开头：${cmd}`,
      ko: `Git 명령은 앞에 git 을 붙입니다: ${cmd}`,
    };
    return missingGit[locale];
  }

  const text = stripAnsi(`${result.stdout}\n${result.stderr}`);
  const sub = first === 'git' ? line.trim().split(/\s+/)[1] : undefined;
  for (const rule of RULES) {
    if (rule.only && (!sub || !rule.only.includes(sub))) continue;
    const match = text.match(rule.pattern);
    if (match) return rule.hint(match)[locale];
  }
  return null;
}
