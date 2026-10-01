import type { RepoSnapshot } from './repo';
import type { SetupStep } from './setup';
import type { CommandResult } from './terminal';

export type PracticeKind = 'lessons' | 'stages' | 'sandbox';

/** 練習用リポジトリ1つを指す */
export interface WorkspaceRef {
  kind: PracticeKind;
  id: string;
}

export interface WorkspaceInfo {
  /** 実際のフォルダの絶対パス */
  path: string;
  /** ターミナルの表示用カレントディレクトリ */
  cwd: string;
}

export const IPC = {
  workspaceOpen: 'workspace:open',
  workspaceReset: 'workspace:reset',
  workspaceReveal: 'workspace:reveal',
  terminalExecute: 'terminal:execute',
  repoSnapshot: 'repo:snapshot',
  filesList: 'files:list',
  filesRead: 'files:read',
  filesWrite: 'files:write',
} as const;

/** preload からレンダラーへ公開する API */
export interface GitGymApi {
  platform: string;
  workspace: {
    /** フォルダが無ければ作って setup で初期状態を組み立て、ターミナルを用意する */
    open(ref: WorkspaceRef, displayName: string, setup?: SetupStep[]): Promise<WorkspaceInfo>;
    /** フォルダを空にして、open で渡した setup で作り直す */
    reset(ref: WorkspaceRef): Promise<WorkspaceInfo>;
    /** エクスプローラー / Finder で開く */
    reveal(ref: WorkspaceRef): Promise<void>;
  };
  terminal: {
    execute(ref: WorkspaceRef, line: string): Promise<CommandResult>;
  };
  repo: {
    /** コミットグラフとファイルの居場所に使う状態を読む */
    snapshot(ref: WorkspaceRef): Promise<RepoSnapshot>;
  };
  files: {
    /** .git を除いたファイルの一覧（/ 区切りの相対パス） */
    list(ref: WorkspaceRef): Promise<string[]>;
    /** 無ければ null */
    read(ref: WorkspaceRef, path: string): Promise<string | null>;
    write(ref: WorkspaceRef, path: string, content: string): Promise<void>;
  };
}
