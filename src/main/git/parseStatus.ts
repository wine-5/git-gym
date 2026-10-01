import type { FileChange, FileState } from '../../shared/repo';

export const STATUS_ARGS = ['status', '--porcelain=v1', '--branch', '--untracked-files=all'];

export interface ParsedStatus {
  branch: string | null;
  working: FileChange[];
  staged: FileChange[];
}

const CONFLICT_CODES = new Set(['DD', 'AU', 'UD', 'UA', 'DU', 'AA', 'UU']);

/**
 * `git status --porcelain=v1 --branch` を解析する。
 * 1文字目（X）がステージ、2文字目（Y）が作業ツリーの状態。
 */
export function parseStatus(output: string): ParsedStatus {
  const result: ParsedStatus = { branch: null, working: [], staged: [] };

  for (const line of output.split('\n')) {
    if (!line) continue;

    if (line.startsWith('## ')) {
      result.branch = parseBranch(line.slice(3));
      continue;
    }

    const code = line.slice(0, 2);
    const path = unquote(line.slice(3).split(' -> ').pop() ?? '');

    if (code === '??') {
      result.working.push({ path, state: 'untracked' });
    } else if (CONFLICT_CODES.has(code)) {
      result.working.push({ path, state: 'conflicted' });
    } else {
      const staged = toState(code[0]);
      const working = toState(code[1]);
      if (staged) result.staged.push({ path, state: staged });
      if (working) result.working.push({ path, state: working });
    }
  }

  return result;
}

/** 例: "main...origin/main [ahead 1]" / "No commits yet on main" / "HEAD (no branch)" */
function parseBranch(text: string): string | null {
  const noCommits = text.match(/^No commits yet on (.+)$/);
  if (noCommits) return noCommits[1];
  if (text.startsWith('HEAD (no branch)')) return null;
  return text.split('...')[0].split(' ')[0];
}

function toState(ch: string): FileState | null {
  switch (ch) {
    case 'M':
    case 'T':
      return 'modified';
    case 'A':
      return 'added';
    case 'D':
      return 'deleted';
    case 'R':
    case 'C':
      return 'renamed';
    default:
      return null;
  }
}

/** 空白などを含むパスは "..." で囲まれて出てくる */
function unquote(path: string): string {
  if (path.startsWith('"') && path.endsWith('"')) {
    return path.slice(1, -1).replace(/\\(["\\])/g, '$1');
  }
  return path;
}
