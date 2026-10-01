export type FileState = 'modified' | 'untracked' | 'added' | 'deleted' | 'renamed' | 'conflicted';

export type RefKind = 'head' | 'local' | 'remote' | 'tag';

export interface CommitRef {
  name: string;
  kind: RefKind;
}

export interface Commit {
  hash: string;
  message: string;
  /** 先頭が第一親 */
  parents: string[];
  refs: CommitRef[];
}

export interface FileChange {
  path: string;
  state: FileState;
}

export interface RepoSnapshot {
  /** .git があるか */
  initialized: boolean;
  /** 今いるブランチ。detached HEAD のときは null */
  branch: string | null;
  /** 新しい順（git log の並び） */
  commits: Commit[];
  working: FileChange[];
  staged: FileChange[];
}

export const EMPTY_REPO: RepoSnapshot = {
  initialized: false,
  branch: null,
  commits: [],
  working: [],
  staged: [],
};
