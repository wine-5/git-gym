/**
 * Git 連携を実装するまでの仮データ。
 * 後で `git log --all --format=...` / `git status --porcelain` の結果からこの形を作る。
 */
export type FileState = 'modified' | 'untracked' | 'added' | 'deleted';

export type RefKind = 'head' | 'local' | 'remote' | 'tag';

export interface CommitRef {
  name: string;
  kind: RefKind;
}

export interface Commit {
  hash: string;
  message: string;
  /** 新しい順。先頭が第一親 */
  parents: string[];
  refs: CommitRef[];
}

export interface FileChange {
  path: string;
  state: FileState;
}

export interface RepoSnapshot {
  branch: string;
  /** 新しい順（git log の並び） */
  commits: Commit[];
  working: FileChange[];
  staged: FileChange[];
}

export function createMockRepo(featureFile: string): RepoSnapshot {
  return {
    branch: 'feature/jump',
    commits: [
      {
        hash: 'e51b7d0',
        message: "Merge branch 'feature/damage'",
        parents: ['a3f9c21', '9d2e4b8'],
        refs: [
          { name: 'HEAD', kind: 'head' },
          { name: 'feature/jump', kind: 'local' },
          { name: 'main', kind: 'local' },
        ],
      },
      { hash: 'a3f9c21', message: 'README を更新', parents: ['7be0d14'], refs: [] },
      { hash: '9d2e4b8', message: 'ダメージ処理を追加', parents: ['7be0d14'], refs: [{ name: 'feature/damage', kind: 'local' }] },
      { hash: '7be0d14', message: 'Player クラスを作成', parents: ['0c41e8a'], refs: [{ name: 'origin/main', kind: 'remote' }] },
      { hash: '0c41e8a', message: '最初のコミット', parents: [], refs: [{ name: 'v0.1', kind: 'tag' }] },
    ],
    working: [{ path: featureFile, state: 'modified' }],
    staged: [],
  };
}

export interface TerminalLine {
  kind: 'command' | 'output' | 'error' | 'success' | 'hint';
  text: string;
  branch?: string;
}

export const MOCK_TERMINAL: TerminalLine[] = [
  { kind: 'command', branch: 'main', text: 'git branch feature/jump' },
  { kind: 'success', text: 'ブランチ feature/jump を作成しました' },
  { kind: 'command', branch: 'main', text: 'git switch feature/jump' },
  { kind: 'output', text: "Switched to branch 'feature/jump'" },
  { kind: 'success', text: 'feature/jump に切り替わりました' },
  { kind: 'command', branch: 'feature/jump', text: 'git comit -m "jump"' },
  { kind: 'error', text: "git: 'comit' is not a git command. See 'git --help'." },
  { kind: 'hint', text: 'もしかして git commit ですか？ スペルを確認してみましょう' },
];
