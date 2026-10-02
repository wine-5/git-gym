import { promises as fs } from 'fs';
import * as path from 'path';
import { tokenize } from '../../shared/commandLine';
import type { CommandResult } from '../../shared/terminal';
import type { GitRunner } from '../git/GitRunner';

const HELP = `このターミナルで使えるコマンド:

  git <コマンド>   Git を実行する（例: git status）
  ls [-a] [フォルダ]  ファイルの一覧を表示する
  cat <ファイル>     ファイルの中身を表示する
  cd <フォルダ>      フォルダを移動する（cd .. で1つ上へ）
  pwd               今いるフォルダを表示する
  clear             画面をきれいにする
  help              この説明を表示する
`;

/** 練習用フォルダの外に出られてしまう git のグローバルオプション */
const BLOCKED_GIT_OPTIONS = ['-C', '--git-dir', '--work-tree', '--exec-path'];

const MAX_CAT_BYTES = 200 * 1024;

/**
 * 本物のターミナル（VS Code など）で打ったときと同じ見た目にする設定。
 * パイプ越しだと git は色やブランチ名の表示（decorate）を省くので、明示的に有効にする。
 * git config は -c の値まで一覧に出てしまうので付けない。
 */
function terminalLookArgs(args: string[]): string[] {
  if (args[0] === 'config') return [];
  return ['-c', 'color.ui=always', '-c', 'log.decorate=short'];
}

/**
 * 練習用リポジトリ1つぶんのターミナル。
 * 本物のシェルは使わず、git と少数の補助コマンドだけを root 配下で実行する。
 */
export class TerminalSession {
  private cwd: string;

  constructor(
    private readonly root: string,
    private readonly displayName: string,
    private readonly git: GitRunner,
    private readonly gitEnv: Record<string, string> = {},
  ) {
    this.cwd = root;
  }

  get displayCwd(): string {
    const relative = path.relative(this.root, this.cwd).split(path.sep).join('/');
    return relative ? `~/${this.displayName}/${relative}` : `~/${this.displayName}`;
  }

  async execute(line: string): Promise<CommandResult> {
    const parsed = tokenize(line.trim());
    if (!parsed.ok) return this.fail(parsed.error);

    const [command, ...args] = parsed.args;
    switch (command) {
      case undefined:
        return this.ok('');
      case 'git':
        return this.runGit(args);
      case 'ls':
      case 'dir':
        return this.ls(args);
      case 'cat':
      case 'type':
        return this.cat(args);
      case 'cd':
        return this.cd(args);
      case 'pwd':
        return this.ok(`${this.displayCwd}\n`);
      case 'clear':
      case 'cls':
        return { ...this.ok(''), clear: true };
      case 'help':
        return this.ok(HELP);
      default:
        return this.fail(`${command}: このターミナルでは使えないコマンドです（help で一覧を表示）`, 127);
    }
  }

  private async runGit(args: string[]): Promise<CommandResult> {
    const blocked = args.find((a) => BLOCKED_GIT_OPTIONS.some((o) => a === o || a.startsWith(`${o}=`)));
    if (blocked) return this.fail(`${blocked} はこのアプリでは使えません`);

    const result = await this.git.run([...terminalLookArgs(args), ...args], this.cwd, { env: this.gitEnv });
    let stderr = result.stderr;
    if (result.timedOut) stderr += '\n（時間がかかりすぎたので止めました）';
    if (result.truncated) stderr += '\n（出力が多すぎるので途中までにしました）';
    return { stdout: result.stdout, stderr, exitCode: result.exitCode, cwd: this.displayCwd };
  }

  private async ls(args: string[]): Promise<CommandResult> {
    const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al');
    const target = args.find((a) => !a.startsWith('-')) ?? '.';
    const dir = this.resolve(target);
    if (!dir) return this.fail(`ls: ${target}: 練習用フォルダの外は見られません`);

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const names = entries
        .filter((e) => showAll || !e.name.startsWith('.'))
        .map((e) => (e.isDirectory() ? `${e.name}/` : e.name))
        .sort((a, b) => a.localeCompare(b));
      return this.ok(names.length ? `${names.join('  ')}\n` : '');
    } catch {
      return this.fail(`ls: ${target}: そのようなフォルダはありません`);
    }
  }

  private async cat(args: string[]): Promise<CommandResult> {
    if (args.length === 0) return this.fail('cat: 表示するファイルを指定してください（例: cat README.md）');

    let stdout = '';
    for (const arg of args) {
      const file = this.resolve(arg);
      if (!file) return this.fail(`cat: ${arg}: 練習用フォルダの外は見られません`);
      try {
        const stat = await fs.stat(file);
        if (stat.isDirectory()) return this.fail(`cat: ${arg}: フォルダです`);
        if (stat.size > MAX_CAT_BYTES) return this.fail(`cat: ${arg}: ファイルが大きすぎます`);
        const content = await fs.readFile(file, 'utf8');
        stdout += content.endsWith('\n') || content === '' ? content : `${content}\n`;
      } catch {
        return this.fail(`cat: ${arg}: そのようなファイルはありません`);
      }
    }
    return this.ok(stdout);
  }

  private async cd(args: string[]): Promise<CommandResult> {
    const target = args[0] ?? '~';
    const dir = target === '~' ? this.root : this.resolve(target);
    if (!dir) return this.fail(`cd: ${target}: 練習用フォルダの外には移動できません`);

    const isDir = await fs
      .stat(dir)
      .then((s) => s.isDirectory())
      .catch(() => false);
    if (!isDir) return this.fail(`cd: ${target}: そのようなフォルダはありません`);

    this.cwd = dir;
    return this.ok('');
  }

  /** root 配下に収まるパスだけを返す */
  private resolve(target: string): string | null {
    const normalized = target.replace(/^~(?=\/|$)/, this.root);
    const resolved = path.resolve(this.cwd, normalized);
    const relative = path.relative(this.root, resolved);
    if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
    return resolved;
  }

  private ok(stdout: string): CommandResult {
    return { stdout, stderr: '', exitCode: 0, cwd: this.displayCwd };
  }

  private fail(stderr: string, exitCode = 1): CommandResult {
    return { stdout: '', stderr: `${stderr}\n`, exitCode, cwd: this.displayCwd };
  }
}
