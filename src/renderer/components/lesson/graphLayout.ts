import type { Commit } from '@data/mockRepo';

/**
 * コミットグラフのレイアウト計算（git-tool の graph-layout.ts を移植）。
 * 新しい順に並んだコミットへ列（col）を割り当てる。副作用なし。
 */
export interface LaidOutCommit extends Commit {
  col: number;
  isMerge: boolean;
}

export function assignColumns(commits: Commit[]): LaidOutCommit[] {
  const result: LaidOutCommit[] = commits.map((c) => ({ ...c, col: 0, isMerge: c.parents.length >= 2 }));
  // 各列が「次に来るはずのコミット hash」を追跡する
  const active: (string | null)[] = [];

  const getOrAlloc = (hash: string): number => {
    const existing = active.indexOf(hash);
    if (existing >= 0) return existing;
    const empty = active.indexOf(null);
    if (empty >= 0) {
      active[empty] = hash;
      return empty;
    }
    active.push(hash);
    return active.length - 1;
  };

  for (const c of result) {
    const col = getOrAlloc(c.hash);
    c.col = col;

    const [first, ...rest] = c.parents;
    if (first) {
      // 同じ親を別の列も追っていたら（分岐点への収束）右側の列を解放する
      const dup = active.findIndex((h, i) => h === first && i !== col);
      if (dup >= 0) {
        const free = Math.max(col, dup);
        active[free] = null;
        if (free !== col) active[col] = first;
      } else {
        active[col] = first;
      }
    } else {
      active[col] = null;
    }

    for (const parent of rest) {
      if (active.indexOf(parent) < 0) getOrAlloc(parent);
    }
  }

  return result;
}
