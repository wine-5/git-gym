/** ターミナルの Tab 補完の候補 */
export interface CompletionSource {
  /** git のサブコマンド */
  subcommands: string[];
  branches: string[];
  files: string[];
}

export interface CompletionResult {
  /** 補完したあとの入力 */
  value: string;
  /** 候補が複数あって決めきれなかったときの一覧（ターミナルに表示する） */
  candidates: string[];
}

const HELPER_COMMANDS = ['git', 'ls', 'cat', 'cd', 'pwd', 'clear', 'help'];

/** ブランチ名を受け取るサブコマンド */
const BRANCH_COMMANDS = new Set(['switch', 'checkout', 'merge', 'rebase', 'branch', 'push', 'pull', 'log', 'diff', 'cherry-pick']);

function commonPrefix(words: string[]): string {
  return words.reduce((prefix, w) => {
    let i = 0;
    while (i < prefix.length && i < w.length && prefix[i] === w[i]) i++;
    return prefix.slice(0, i);
  });
}

/**
 * 最後の単語を補完する（シェルの Tab 補完と同じ考え方）。
 * 1つに決まればスペースまで付け、複数なら共通部分まで伸ばして候補を返す。
 */
export function complete(input: string, source: CompletionSource): CompletionResult {
  const words = input.split(' ');
  const current = words[words.length - 1];
  const before = words.slice(0, -1).filter(Boolean);

  let pool: string[];
  if (before.length === 0) {
    pool = HELPER_COMMANDS;
  } else if (before[0] === 'git' && before.length === 1) {
    pool = source.subcommands;
  } else if (before[0] === 'git' && BRANCH_COMMANDS.has(before[1]) && !current.startsWith('-')) {
    pool = [...source.branches, ...source.files];
  } else {
    pool = source.files;
  }

  const matches = [...new Set(pool)].filter((w) => w.startsWith(current)).sort();
  if (matches.length === 0) return { value: input, candidates: [] };

  const head = words.slice(0, -1).join(' ');
  const join = (word: string) => (head ? `${head} ${word}` : word);
  if (matches.length === 1) return { value: `${join(matches[0])} `, candidates: [] };

  const prefix = commonPrefix(matches);
  return { value: join(prefix.length > current.length ? prefix : current), candidates: matches };
}
