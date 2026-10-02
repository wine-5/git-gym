import type { CommandResult } from '@shared/terminal';
import { stripAnsi } from './ansi';

const GIT_SUBCOMMANDS = new Set([
  'init', 'status', 'add', 'commit', 'log', 'diff', 'branch', 'switch', 'checkout', 'merge', 'restore',
  'reset', 'revert', 'stash', 'push', 'pull', 'fetch', 'clone', 'remote', 'tag', 'rebase', 'cherry-pick', 'show', 'config',
]);

interface Rule {
  pattern: RegExp;
  hint: (match: RegExpMatchArray) => string;
  /** このサブコマンドのときだけ出す（git status の説明文などに反応しないように） */
  only?: string[];
}

/** git の出力（英語）に対応する、初心者向けの日本語ヒント */
const RULES: Rule[] = [
  {
    pattern: /The most similar commands? (?:is|are)\s+(\S+)/,
    hint: (m) => `もしかして git ${m[1]} ですか？ スペルを確認してみましょう`,
  },
  { pattern: /not a git repository/, hint: () => 'まだ Git のリポジトリではありません。まず git init で作りましょう' },
  {
    pattern: /Aborting commit due to empty commit message/,
    hint: () => 'コミットにはメッセージが必要です。git commit -m "メッセージ" のように -m を付けましょう',
  },
  {
    pattern: /nothing added to commit but untracked files present/,
    hint: () => 'ステージに何もありません。git add <ファイル名> でステージに乗せてからコミットしましょう',
    only: ['commit'],
  },
  {
    pattern: /no changes added to commit/,
    hint: () => '変更はありますが、まだステージに乗っていません。先に git add しましょう',
    only: ['commit'],
  },
  {
    pattern: /nothing to commit, working tree clean/,
    hint: () => 'コミットする変更がありません。ファイルを編集してから試しましょう',
    only: ['commit'],
  },
  {
    pattern: /pathspec '(.+?)' did not match any file/,
    hint: (m) => `「${m[1]}」というファイル（またはブランチ）が見つかりません。ls や git branch で名前を確認しましょう`,
  },
  {
    pattern: /invalid reference: (\S+)/,
    hint: (m) => `「${m[1]}」というブランチはありません。git branch で一覧を確認しましょう。新しく作るなら git switch -c ${m[1]}`,
  },
  {
    pattern: /a branch named '(.+?)' already exists/,
    hint: (m) => `「${m[1]}」はもうあります。切り替えるなら git switch ${m[1]}`,
  },
  {
    pattern: /Your local changes to the following files would be overwritten/,
    hint: () => 'まだコミットしていない変更があるので切り替えられません。先にコミットするか git stash で一時退避しましょう',
  },
  {
    pattern: /CONFLICT/,
    hint: () => 'コンフリクト（衝突）が起きました。エディタで <<<<<<< 〜 >>>>>>> の部分を直してから git add → git commit しましょう',
  },
  {
    pattern: /\[rejected\]|failed to push some refs/,
    hint: () => 'リモートに自分の知らない変更があるので push できません。先に git pull で取り込みましょう',
  },
  {
    pattern: /has no upstream branch/,
    hint: () => '初めて push するブランチです。git push -u origin <ブランチ名> で送りましょう',
  },
  { pattern: /Please tell me who you are/, hint: () => 'git config user.name と user.email を設定しましょう' },
  { pattern: /unknown (?:option|switch)/, hint: () => 'オプションのつづりを確認しましょう。-h を付けると使い方が表示されます' },
  {
    pattern: /You have not concluded your merge|MERGE_HEAD exists/,
    hint: () => 'マージの途中です。コンフリクトを直して git add → git commit するか、git merge --abort でやめましょう',
  },
];

/** 打ったコマンドと結果から、出すべきヒントを1つ返す */
export function hintFor(line: string, result: CommandResult): string | null {
  const first = line.trim().split(/\s+/)[0];
  if (result.exitCode === 127 && GIT_SUBCOMMANDS.has(first)) {
    return `Git のコマンドは先頭に git を付けます: git ${line.trim()}`;
  }

  const text = stripAnsi(`${result.stdout}\n${result.stderr}`);
  const sub = first === 'git' ? line.trim().split(/\s+/)[1] : undefined;
  for (const rule of RULES) {
    if (rule.only && (!sub || !rule.only.includes(sub))) continue;
    const match = text.match(rule.pattern);
    if (match) return rule.hint(match);
  }
  return null;
}
