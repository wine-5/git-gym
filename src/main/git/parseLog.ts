import type { Commit, CommitRef } from '../../shared/repo';

const FIELD = '\x1f';
const RECORD = '\x1e';

/** parseLog が読める形式で git log を出すための引数 */
export const LOG_ARGS = [
  'log',
  '--all',
  '--topo-order',
  '--decorate=full',
  '--max-count=200',
  `--format=%h${FIELD}%p${FIELD}%D${FIELD}%s${RECORD}`,
];

export function parseLog(output: string): Commit[] {
  return output
    .split(RECORD)
    .map((record) => record.replace(/^\s+/, ''))
    .filter((record) => record.length > 0)
    .map((record) => {
      const [hash, parents, decorations, message] = record.split(FIELD);
      return {
        hash,
        message: message ?? '',
        parents: parents ? parents.split(' ').filter(Boolean) : [],
        refs: parseRefs(decorations ?? ''),
      };
    });
}

/**
 * %D（--decorate=full）を解析する。
 * 例: "HEAD -> refs/heads/main, refs/remotes/origin/main, tag: refs/tags/v0.1"
 */
export function parseRefs(decorations: string): CommitRef[] {
  const refs: CommitRef[] = [];
  for (const raw of decorations.split(', ').map((d) => d.trim())) {
    if (!raw) continue;

    if (raw === 'HEAD') {
      refs.push({ name: 'HEAD', kind: 'head' });
    } else if (raw.startsWith('HEAD -> ')) {
      refs.push({ name: 'HEAD', kind: 'head' });
      refs.push(...parseRefs(raw.slice('HEAD -> '.length)));
    } else if (raw.startsWith('tag: ')) {
      refs.push({ name: raw.slice('tag: '.length).replace(/^refs\/tags\//, ''), kind: 'tag' });
    } else if (raw.startsWith('refs/heads/')) {
      refs.push({ name: raw.slice('refs/heads/'.length), kind: 'local' });
    } else if (raw.startsWith('refs/remotes/')) {
      const name = raw.slice('refs/remotes/'.length);
      // origin/HEAD はリモートの既定ブランチを指すだけなので表示しない
      if (!name.endsWith('/HEAD')) refs.push({ name, kind: 'remote' });
    } else if (raw.startsWith('refs/stash')) {
      continue;
    } else {
      refs.push({ name: raw, kind: 'local' });
    }
  }
  return refs;
}
