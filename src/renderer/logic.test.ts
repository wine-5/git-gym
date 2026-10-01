import { describe, expect, it } from 'vitest';
import { assignColumns } from '@components/lesson/graphLayout';
import { findConflicts } from '@components/editor/conflictRegions';
import { hintFor } from '@data/commandHints';
import { progressCsv } from '@data/exportProgress';
import { starsFor } from '@data/stages';
import { fillPlaceholders } from '@data/lessons';
import type { CommandResult } from '@shared/terminal';

const result = (stdout: string, stderr = '', exitCode = 0): CommandResult => ({ stdout, stderr, exitCode, cwd: '~' });

describe('assignColumns', () => {
  it('分岐したブランチは右の列、合流後は左に戻る', () => {
    const laid = assignColumns([
      { hash: 'm', message: 'merge', parents: ['a', 'b'], refs: [] },
      { hash: 'a', message: 'main', parents: ['base'], refs: [] },
      { hash: 'b', message: 'feature', parents: ['base'], refs: [] },
      { hash: 'base', message: 'base', parents: [], refs: [] },
    ]);
    expect(laid.map((c) => [c.hash, c.col, c.isMerge])).toEqual([
      ['m', 0, true],
      ['a', 0, false],
      ['b', 1, false],
      ['base', 0, false],
    ]);
  });
});

describe('findConflicts', () => {
  it('<<<<<<< / ======= / >>>>>>> の行番号を返す', () => {
    const text = ['a', '<<<<<<< HEAD', 'x', '=======', 'y', '>>>>>>> feature', 'b'].join('\n');
    expect(findConflicts(text)).toEqual([{ start: 2, separator: 4, end: 6 }]);
  });

  it('途中で終わっているものは数えない', () => {
    expect(findConflicts('<<<<<<< HEAD\nx\n')).toEqual([]);
  });
});

describe('hintFor', () => {
  it('打ち間違いに「もしかして」を出す', () => {
    const hint = hintFor('git comit -m x', result('', "git: 'comit' is not a git command.\n\nThe most similar command is\n\tcommit\n", 1));
    expect(hint).toContain('git commit');
  });

  it('git を付け忘れたら教える', () => {
    expect(hintFor('status', result('', 'status: 使えないコマンド', 127))).toContain('git status');
  });

  it('commit の -m 忘れ', () => {
    expect(hintFor('git commit', result('', 'Aborting commit due to empty commit message.', 1))).toContain('-m');
  });

  it('git status の説明文にはコミット用のヒントを出さない', () => {
    expect(hintFor('git status', result('nothing to commit, working tree clean'))).toBeNull();
  });

  it('push が断られたら pull を勧める', () => {
    expect(hintFor('git push', result('', ' ! [rejected]        main -> main (fetch first)', 1))).toContain('git pull');
  });
});

describe('starsFor', () => {
  it.each([
    [0, false, 3],
    [1, false, 2],
    [2, false, 2],
    [3, false, 1],
    [0, true, 2],
    [5, true, 1],
  ])('失敗 %i 回・答えを見た %s → ★%i', (failed, saw, stars) => {
    expect(starsFor(failed, saw)).toBe(stars);
  });
});

describe('fillPlaceholders', () => {
  it('知らない名前はそのまま残す', () => {
    expect(fillPlaceholders('`{featureFile}` と {unknown}', { featureFile: 'Player.cs' })).toBe('`Player.cs` と {unknown}');
  });
});

describe('progressCsv', () => {
  it('BOM 付きで、クリアしたレッスンに ○ を付ける', () => {
    const csv = progressCsv({ completed: new Set(['1-1']), learned: new Set(['init']), language: 'C#' }, new Date(2026, 9, 1));
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv).toContain('1-1,リポジトリを作ろう,○');
    expect(csv).toContain('git init,○');
    expect(csv).toContain('1-2,状態を確認しよう,\r\n');
  });
});
