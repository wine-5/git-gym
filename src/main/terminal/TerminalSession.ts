import { promises as fs } from 'fs';
import * as path from 'path';
import { tokenize } from '../../shared/commandLine';
import type { CommandResult } from '../../shared/terminal';
import type { GitRunner } from '../git/GitRunner';
import { pick } from '../i18n';

/** help の説明。表示言語は呼んだときのものを使う */
const help = (): string =>
  pick({
    ja: `このターミナルで使えるコマンド:

  git <コマンド>   Git を実行する（例: git status）
  ls [-a] [フォルダ]  ファイルの一覧を表示する
  cat <ファイル>     ファイルの中身を表示する
  cd <フォルダ>      フォルダを移動する（cd .. で1つ上へ）
  pwd               今いるフォルダを表示する
  clear             画面をきれいにする
  help              この説明を表示する
`,
    en: `Commands you can use in this terminal:

  git <command>       Run Git (e.g. git status)
  ls [-a] [folder]    List files
  cat <file>          Show what's inside a file
  cd <folder>         Move to a folder (cd .. goes up one)
  pwd                 Show the folder you're in
  clear               Clear the screen
  help                Show this help
`,
    zh: `这个终端中可以使用的命令：

  git <命令>         执行 Git（例：git status）
  ls [-a] [文件夹]   显示文件列表
  cat <文件>         显示文件内容
  cd <文件夹>        切换文件夹（cd .. 返回上一级）
  pwd                显示当前所在的文件夹
  clear              清空屏幕
  help               显示这个说明
`,
    ko: `이 터미널에서 쓸 수 있는 명령어:

  git <명령어>      Git 실행 (예: git status)
  ls [-a] [폴더]    파일 목록 보기
  cat <파일>        파일 내용 보기
  cd <폴더>         폴더 이동 (cd .. 로 한 단계 위로)
  pwd               지금 있는 폴더 보기
  clear             화면 지우기
  help              이 설명 보기
`,
  });

const outsideView = () =>
  pick({
    ja: '練習用フォルダの外は見られません',
    en: "can't look outside the practice folder",
    zh: '不能查看练习文件夹之外的内容',
    ko: '연습용 폴더 밖은 볼 수 없어요',
  });

const noSuchFolder = () =>
  pick({ ja: 'そのようなフォルダはありません', en: 'no such folder', zh: '没有这个文件夹', ko: '그런 폴더가 없어요' });

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
    if (!parsed.ok) {
      const q = parsed.quote;
      return this.fail(
        pick({
          ja: `クォート ${q} が閉じられていません`,
          en: `The quote ${q} is not closed`,
          zh: `引号 ${q} 没有闭合`,
          ko: `따옴표 ${q} 가 닫히지 않았어요`,
        }),
      );
    }

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
        return this.ok(help());
      default:
        return this.fail(
          pick({
            ja: `${command}: このターミナルでは使えないコマンドです（help で一覧を表示）`,
            en: `${command}: this command isn't available in this terminal (type help for a list)`,
            zh: `${command}：这个终端不支持该命令（输入 help 查看列表）`,
            ko: `${command}: 이 터미널에서는 쓸 수 없는 명령어예요 (help 로 목록 보기)`,
          }),
          127,
        );
    }
  }

  private async runGit(args: string[]): Promise<CommandResult> {
    const blocked = args.find((a) => BLOCKED_GIT_OPTIONS.some((o) => a === o || a.startsWith(`${o}=`)));
    if (blocked)
      return this.fail(
        pick({
          ja: `${blocked} はこのアプリでは使えません`,
          en: `${blocked} can't be used in this app`,
          zh: `${blocked} 在这个应用中不能使用`,
          ko: `${blocked} 는 이 앱에서 쓸 수 없어요`,
        }),
      );

    const result = await this.git.run([...terminalLookArgs(args), ...args], this.cwd, { env: this.gitEnv });
    let stderr = result.stderr;
    if (result.timedOut)
      stderr += pick({
        ja: '\n（時間がかかりすぎたので止めました）',
        en: '\n(Stopped because it took too long)',
        zh: '\n（耗时太长，已停止）',
        ko: '\n(시간이 너무 오래 걸려서 멈췄어요)',
      });
    if (result.truncated)
      stderr += pick({
        ja: '\n（出力が多すぎるので途中までにしました）',
        en: '\n(Output was too long, so it was cut off)',
        zh: '\n（输出太多，只显示了一部分）',
        ko: '\n(출력이 너무 많아서 중간까지만 표시했어요)',
      });
    return { stdout: result.stdout, stderr, exitCode: result.exitCode, cwd: this.displayCwd };
  }

  private async ls(args: string[]): Promise<CommandResult> {
    const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al');
    const target = args.find((a) => !a.startsWith('-')) ?? '.';
    const dir = this.resolve(target);
    if (!dir) return this.fail(`ls: ${target}: ${outsideView()}`);

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const names = entries
        .filter((e) => showAll || !e.name.startsWith('.'))
        .map((e) => (e.isDirectory() ? `${e.name}/` : e.name))
        .sort((a, b) => a.localeCompare(b));
      return this.ok(names.length ? `${names.join('  ')}\n` : '');
    } catch {
      return this.fail(`ls: ${target}: ${noSuchFolder()}`);
    }
  }

  private async cat(args: string[]): Promise<CommandResult> {
    if (args.length === 0)
      return this.fail(
        pick({
          ja: 'cat: 表示するファイルを指定してください（例: cat README.md）',
          en: 'cat: tell me which file to show (e.g. cat README.md)',
          zh: 'cat：请指定要显示的文件（例：cat README.md）',
          ko: 'cat: 표시할 파일을 지정해 주세요 (예: cat README.md)',
        }),
      );

    let stdout = '';
    for (const arg of args) {
      const file = this.resolve(arg);
      if (!file) return this.fail(`cat: ${arg}: ${outsideView()}`);
      try {
        const stat = await fs.stat(file);
        if (stat.isDirectory()) return this.fail(`cat: ${arg}: ${pick({ ja: 'フォルダです', en: 'is a folder', zh: '这是一个文件夹', ko: '폴더예요' })}`);
        if (stat.size > MAX_CAT_BYTES)
          return this.fail(`cat: ${arg}: ${pick({ ja: 'ファイルが大きすぎます', en: 'file is too large', zh: '文件太大了', ko: '파일이 너무 커요' })}`);
        const content = await fs.readFile(file, 'utf8');
        stdout += content.endsWith('\n') || content === '' ? content : `${content}\n`;
      } catch {
        return this.fail(`cat: ${arg}: ${pick({ ja: 'そのようなファイルはありません', en: 'no such file', zh: '没有这个文件', ko: '그런 파일이 없어요' })}`);
      }
    }
    return this.ok(stdout);
  }

  private async cd(args: string[]): Promise<CommandResult> {
    const target = args[0] ?? '~';
    const dir = target === '~' ? this.root : this.resolve(target);
    if (!dir)
      return this.fail(
        `cd: ${target}: ${pick({ ja: '練習用フォルダの外には移動できません', en: "can't move outside the practice folder", zh: '不能移动到练习文件夹之外', ko: '연습용 폴더 밖으로는 이동할 수 없어요' })}`,
      );

    const isDir = await fs
      .stat(dir)
      .then((s) => s.isDirectory())
      .catch(() => false);
    if (!isDir) return this.fail(`cd: ${target}: ${noSuchFolder()}`);

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
