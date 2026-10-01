/**
 * 達成判定のためにレンダラーから送られる git コマンドが、リポジトリを変更しないかを確かめる。
 * 読み取り専用のサブコマンドと引数の組み合わせだけを許可する。
 */
const ALWAYS_READ_ONLY = new Set([
  'log',
  'show',
  'rev-parse',
  'rev-list',
  'diff',
  'status',
  'ls-files',
  'ls-tree',
  'cat-file',
  'merge-base',
  'for-each-ref',
  'show-ref',
]);

export function isReadOnlyQuery(args: string[]): boolean {
  const [command, ...rest] = args;
  if (!command) return false;
  if (ALWAYS_READ_ONLY.has(command)) return !rest.some((a) => a === '--output' || a.startsWith('--output='));

  switch (command) {
    case 'branch':
    case 'tag':
      // 名前を渡すと作成になるので、オプションだけ許可する（-d などの変更系は除く）
      return rest.every((a) => a.startsWith('-') && !/^-(d|D|m|M|c|C|f|u)$|^--(delete|move|copy|force|set-upstream|unset-upstream|edit-description)/.test(a));
    case 'stash':
      return rest[0] === 'list';
    case 'remote':
      return rest.length === 0 || rest[0] === '-v' || rest[0] === 'get-url';
    case 'config':
      return rest[0] === '--get' || rest[0] === '--list' || rest[0] === '-l';
    default:
      return false;
  }
}
