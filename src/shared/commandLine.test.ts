import { describe, expect, it } from 'vitest';
import { tokenize } from './commandLine';

describe('tokenize', () => {
  it('空白で区切る', () => {
    expect(tokenize('git  log   --oneline')).toEqual({ ok: true, args: ['git', 'log', '--oneline'] });
  });

  it('クォートの中の空白はそのまま', () => {
    expect(tokenize('git commit -m "最初 の コミット"')).toEqual({ ok: true, args: ['git', 'commit', '-m', '最初 の コミット'] });
    expect(tokenize("git commit -m 'single quoted'")).toEqual({ ok: true, args: ['git', 'commit', '-m', 'single quoted'] });
  });

  it('ダブルクォートの中の \\" は " になる', () => {
    expect(tokenize('git commit -m "say \\"hi\\""')).toEqual({ ok: true, args: ['git', 'commit', '-m', 'say "hi"'] });
  });

  it('空のクォートも1つの引数', () => {
    expect(tokenize('git commit -m ""')).toEqual({ ok: true, args: ['git', 'commit', '-m', ''] });
  });

  it('閉じていないクォートはエラー', () => {
    expect(tokenize('git commit -m "oops').ok).toBe(false);
  });
});
