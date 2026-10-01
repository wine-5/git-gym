import { execFile } from 'child_process';

export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  /** 制限時間を超えて打ち切った */
  timedOut: boolean;
  /** 出力が多すぎて途中で切った */
  truncated: boolean;
}

export interface RunOptions {
  timeoutMs?: number;
  maxOutputBytes?: number;
  /** 追加・上書きする環境変数 */
  env?: Record<string, string>;
}

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_OUTPUT = 512 * 1024;

/**
 * 練習用の git をシェルを通さずに実行する。
 * エディタやページャーが開いて固まらないよう、対話が必要な処理は環境変数で無効にしておく。
 */
export class GitRunner {
  constructor(private readonly gitPath: string) {}

  run(args: string[], cwd: string, options: RunOptions = {}): Promise<RunResult> {
    const env = {
      ...process.env,
      // コミットメッセージ未指定でもエディタを開かず、空メッセージで中断させる
      GIT_EDITOR: ':',
      GIT_SEQUENCE_EDITOR: ':',
      GIT_PAGER: 'cat',
      PAGER: 'cat',
      GIT_TERMINAL_PROMPT: '0',
      GIT_ASKPASS: '',
      GIT_CONFIG_NOSYSTEM: '1',
      // 学生 PC の設定に左右されないよう、練習用の名前を使う
      GIT_AUTHOR_NAME: 'Git Gym',
      GIT_AUTHOR_EMAIL: 'student@git-gym.local',
      GIT_COMMITTER_NAME: 'Git Gym',
      GIT_COMMITTER_EMAIL: 'student@git-gym.local',
      ...options.env,
    };

    return new Promise((resolve) => {
      execFile(
        this.gitPath,
        args,
        {
          cwd,
          env,
          timeout: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
          maxBuffer: options.maxOutputBytes ?? DEFAULT_MAX_OUTPUT,
          windowsHide: true,
          encoding: 'utf8',
        },
        (error, stdout, stderr) => {
          const err = error as (NodeJS.ErrnoException & { killed?: boolean; code?: number | string }) | null;
          const truncated = err?.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER';
          const timedOut = !truncated && !!err?.killed;
          let exitCode = 0;
          if (err) exitCode = typeof err.code === 'number' ? err.code : 1;

          resolve({
            stdout,
            stderr: err && err.code === 'ENOENT' ? 'git が見つかりませんでした' : stderr,
            exitCode,
            timedOut,
            truncated,
          });
        },
      );
    });
  }
}
