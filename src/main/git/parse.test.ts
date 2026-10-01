import { describe, expect, it } from 'vitest';
import { parseLog, parseRefs } from './parseLog';
import { parseStatus } from './parseStatus';
import { isReadOnlyQuery } from './readOnlyQuery';

describe('parseRefs', () => {
  it('HEAD・ローカル・リモート・タグを見分ける', () => {
    expect(parseRefs('HEAD -> refs/heads/main, refs/remotes/origin/main, tag: refs/tags/v1.0')).toEqual([
      { name: 'HEAD', kind: 'head' },
      { name: 'main', kind: 'local' },
      { name: 'origin/main', kind: 'remote' },
      { name: 'v1.0', kind: 'tag' },
    ]);
  });

  it('origin/HEAD と stash は表示しない', () => {
    expect(parseRefs('refs/remotes/origin/HEAD, refs/stash')).toEqual([]);
  });

  it('detached HEAD を扱える', () => {
    expect(parseRefs('HEAD')).toEqual([{ name: 'HEAD', kind: 'head' }]);
  });
});

describe('parseLog', () => {
  it('区切り文字で並んだコミットを読む', () => {
    const out = 'a1\x1fb2 c3\x1fHEAD -> refs/heads/main\x1fMerge branch\x1e\nb2\x1f\x1f\x1f最初のコミット\x1e\n';
    expect(parseLog(out)).toEqual([
      { hash: 'a1', parents: ['b2', 'c3'], refs: [{ name: 'HEAD', kind: 'head' }, { name: 'main', kind: 'local' }], message: 'Merge branch' },
      { hash: 'b2', parents: [], refs: [], message: '最初のコミット' },
    ]);
  });

  it('空の出力は空の配列', () => {
    expect(parseLog('')).toEqual([]);
  });
});

describe('parseStatus', () => {
  it('ステージ・作業ツリー・未追跡を分ける', () => {
    const out = ['## main...origin/main [ahead 1]', 'M  staged.cs', ' M working.cs', 'MM both.cs', '?? new.cs', 'A  added.cs', ''].join('\n');
    const s = parseStatus(out);
    expect(s.branch).toBe('main');
    expect(s.staged).toEqual([
      { path: 'staged.cs', state: 'modified' },
      { path: 'both.cs', state: 'modified' },
      { path: 'added.cs', state: 'added' },
    ]);
    expect(s.working).toEqual([
      { path: 'working.cs', state: 'modified' },
      { path: 'both.cs', state: 'modified' },
      { path: 'new.cs', state: 'untracked' },
    ]);
  });

  it('コンフリクトを見つける', () => {
    expect(parseStatus('## main\nUU Player.cs\n').working).toEqual([{ path: 'Player.cs', state: 'conflicted' }]);
  });

  it('コミットが無いブランチ名と detached HEAD', () => {
    expect(parseStatus('## No commits yet on main\n').branch).toBe('main');
    expect(parseStatus('## HEAD (no branch)\n').branch).toBeNull();
  });

  it('空白を含むパスと名前の変更', () => {
    const s = parseStatus('## main\nR  old.cs -> "new file.cs"\n');
    expect(s.staged).toEqual([{ path: 'new file.cs', state: 'renamed' }]);
  });
});

describe('isReadOnlyQuery', () => {
  it.each([
    ['log --oneline', true],
    ['rev-list --count main..origin/main', true],
    ['branch --format=%(refname:short)', true],
    ['branch -a', true],
    ['stash list', true],
    ['config --get user.name', true],
    ['remote -v', true],
  ])('読み取り: git %s', (cmd, expected) => {
    expect(isReadOnlyQuery(cmd.split(' '))).toBe(expected);
  });

  it.each([
    ['commit -m x'],
    ['branch new-branch'],
    ['branch -D main'],
    ['branch -u origin/main'],
    ['tag v1'],
    ['stash'],
    ['remote add origin x'],
    ['config user.name x'],
    ['log --output=evil.txt'],
    ['push'],
  ])('変更系は拒否: git %s', (cmd) => {
    expect(isReadOnlyQuery(cmd.split(' '))).toBe(false);
  });
});
