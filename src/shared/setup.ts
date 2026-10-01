/**
 * レッスン開始時の練習用リポジトリを組み立てる手順。
 * main プロセスが上から順に実行する（レンダラーから任意のコマンドは送れないよう、種類を限定する）。
 */
export type SetupStep =
  /** ファイルを書く（無ければフォルダごと作る） */
  | { kind: 'write'; path: string; content: string }
  /** ファイルを消す */
  | { kind: 'delete'; path: string }
  /** 練習用リポジトリで git を実行する */
  | { kind: 'git'; args: string[] }
  /** GitGym/remotes に bare リポジトリを作り、origin として登録する */
  | { kind: 'remote'; name?: string }
  /** 「チームメイト」として remote に直接コミットを積む（pull の練習用） */
  | { kind: 'teammate'; message: string; files: { path: string; content: string }[] };
