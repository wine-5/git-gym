/** ターミナルで1行実行した結果 */
export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  /** 実行後のカレントディレクトリ（表示用、例: ~/my-game/src） */
  cwd: string;
  /** clear が実行された */
  clear?: boolean;
}
